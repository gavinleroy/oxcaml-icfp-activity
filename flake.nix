{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    depot.url = "github:cognitive-engineering-lab/depot";
    mdbook-quiz.url = "github:cognitive-engineering-lab/mdbook-quiz";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      depot,
      mdbook-quiz,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ depot.overlays.default ];
        };
        mdbookqz = mdbook-quiz.packages.${system}.default.override {
          enableSourceMap = true;
          enableRustEditor = false;
          enableAquascope = false;
        };

        telemetry-pkg = pkgs.mkDepotPackage {
          pname = "telemetry";
          version = "0.1.0";
          src = pkgs.lib.cleanSource ./telemetry;
          pnpmHash = "sha256-IU01f2iit4SjgHt6pKdGRxdgsVHobCwf5zQ/8JyOhn4=";
        };

        activity-book = pkgs.stdenv.mkDerivation {
          pname = "activity-book";
          version = "0.1.0";
          src = pkgs.lib.cleanSource ./book;

          nativeBuildInputs = [
            mdbookqz
            pkgs.mdbook
          ];

          buildPhase = ''
            rm -rf telemetry/dist
            mkdir -p telemetry/dist
            ln -s ${telemetry-pkg}/* telemetry/dist/
            mdbook build
          '';

          installPhase = ''
            mkdir -p $out
            cp -R book/* $out
          '';
        };

        juliaEnv = pkgs.julia-bin.withPackages [
          "Pluto"
          "PlutoUI"
          "JSON3"
          "DataFrames"
          "Dates"
          "Statistics"
          "StatsPlots"
        ];

        analysis = pkgs.stdenv.mkDerivation {
          name = "analysis";
          src = pkgs.lib.cleanSource ./analysis;
          nativeBuildInputs = [ juliaEnv ];

          buildPhase = ''
            export JULIA_DEPOT_PATH=$(mktemp -d)
            export JULIA_PKG_OFFLINE=true
            cp -rL ${juliaEnv}/share/julia/site/* $JULIA_DEPOT_PATH/ 2>/dev/null || true

            julia -e '
            import Pluto; 
            session = Pluto.ServerSession();
            session.options.server.disable_writing_notebook_files = true;
            session.options.evaluation.workspace_use_distributed = false;
            nb = Pluto.SessionActions.open(session, "notebook.jl"; run_async=false);
            html_contents = Pluto.generate_html(nb);
            write("index.html", html_contents);
            '
          '';

          installPhase = ''
            mkdir -p $out
            mkdir -p $out
            cp index.html $out/
            cp -R responses $out/
            cp -LR assets $out/
          '';
        };

        sbclServer = pkgs.sbcl.withPackages (
          ps: with ps; [
            woo
            cl-cpus
          ]
        );

        oxserver = pkgs.stdenv.mkDerivation rec {
          pname = "oxserver";
          version = "1.0.0";
          src = pkgs.lib.cleanSource ./server;
          nativeBuildInputs = [
            sbclServer
            pkgs.makeWrapper
          ];
          buildInputs = with pkgs; [
            libev
            openssl
          ];
          dontStrip = true;
          buildPhase = ''
            cat > build-script.lisp <<EOF
            (require :sb-concurrency)
            (require :asdf)
            (asdf:load-system :woo)
            (asdf:load-system :cl-cpus)
            (load "oxserver.lisp")
            (sb-ext:save-lisp-and-die "oxserver"
              :toplevel #'oxserver:main
              :executable t
              :compression t)
            EOF
            sbcl --load build-script.lisp
          '';
          installPhase = ''
            mkdir -p $out/bin
            cp oxserver $out/bin/
            wrapProgram $out/bin/oxserver \
            --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath buildInputs}"
          '';
        };

        website = pkgs.stdenv.mkDerivation {
          pname = "website";
          version = "0.1.0";
          phases = [ "installPhase" ];

          installPhase = ''
            mkdir -p $out
            mkdir -p $out/analysis
            cp -r ${activity-book}/* $out/
            cp -r ${analysis}/* $out/analysis/
          '';
        };
      in
      {
        packages = {
          inherit
            telemetry-pkg
            activity-book
            analysis
            website
            oxserver
            ;
          default = activity-book;
        };

        devShell = pkgs.mkShell {
          inputsFrom = [
            telemetry-pkg
            activity-book
            analysis
            oxserver
          ];
          buildInputs = [ pkgs.wrk ];
        };
      }
    );
}
