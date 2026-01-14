{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    depot-js.url = "github:cognitive-engineering-lab/depot";
    mdbook-quiz.url = "github:cognitive-engineering-lab/mdbook-quiz";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      depot-js,
      mdbook-quiz,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        depotjs = depot-js.packages.${system}.default;
        mdbookqz = mdbook-quiz.packages.${system}.default.override {
          enableSourceMap = true;
          enableRustEditor = false;
          enableAquascope = false;
        };

        telemetry-pkg = pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = "telemetry";
          version = "0.1.0";
          src = pkgs.lib.cleanSource ./telemetry;
          nativeBuildInputs = with pkgs; [
            cacert
            pnpm_9
            nodejs_22
            depotjs
          ];

          pnpmDeps = pkgs.pnpm_9.fetchDeps {
            inherit (finalAttrs) pname version src;
            fetcherVersion = 2;
            hash = "sha256-IU01f2iit4SjgHt6pKdGRxdgsVHobCwf5zQ/8JyOhn4=";
          };

          buildPhase = ''
            set -euo pipefail
            export NPM_CONFIG_OFFLINE=true
            export PNPM_WRITABLE_STORE=$(mktemp -d)
            cp -LR ${finalAttrs.pnpmDeps}/* $PNPM_WRITABLE_STORE/ || true
            chmod -R +w $PNPM_WRITABLE_STORE
            export npm_config_store_dir=$PNPM_WRITABLE_STORE
            depot b --release
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/ 
          '';
        });

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

        devShell =
          with pkgs;
          pkgs.mkShell {
            buildInputs = [
              cacert
              pnpm_9
              nodejs_22
              depotjs
              mdbookqz
              mdbook

              juliaEnv

              sbclServer
              libev
              openssl
              wrk
            ];
          };
      }
    );
}
