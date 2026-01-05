{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    depot-js.url = "github:cognitive-engineering-lab/depot";
    mdbook-quiz.url = "github:cognitive-engineering-lab/mdbook-quiz";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      rust-overlay,
      depot-js,
      mdbook-quiz,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        depotjs = depot-js.packages.${system}.default;
        mdbookqz = mdbook-quiz.packages.${system}.default;

        push-to-pages = pkgs.writeScriptBin "push-to-pages" ''
          cd telemetry && depot b --release && cd - && mdbook build -d out &&
          git checkout gh-pages &&
          git rm -rf . && cp -R out/* . && rm -rf out &&
          git add . && git commit -m "Deploy book at $(date)" &&
          git push origin gh-pages &&
          git checkout main &&
          echo "✅ Book deployed!"
        '';

        sbclWithDeps = pkgs.sbcl.withPackages (ps: with ps; [ woo ]);
      in
      {
        packages = {
          oxserver = pkgs.stdenv.mkDerivation rec {
            pname = "oxserver";
            version = "1.0.0";
            src = ./.;
            nativeBuildInputs = [
              sbclWithDeps
              pkgs.makeWrapper
            ];
            buildInputs = with pkgs; [ libev openssl ];
            dontStrip = true;
            buildPhase = ''
              cat > build-script.lisp <<EOF
              (require :sb-concurrency)
              (require :asdf)
              (asdf:load-system :woo)
              (load "scripts/oxserver.lisp")
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

          activity-book = pkgs.stdenv.mkDerivation (finalAttrs: rec {
            pname = "tutorial-book";
            version = "0.1.0";
            src = pkgs.lib.cleanSource ./.;

            nativeBuildInputs = with pkgs; [
              cacert
              pnpm_9
              nodejs_22
              depotjs
              mdbookqz
              mdbook
            ];

            pnpmRoot = "telemetry";
            pnpmDeps = pkgs.pnpm_9.fetchDeps {
              inherit (finalAttrs) pname version src;
              fetcherVersion = 2;
              hash = "sha256-IU01f2iit4SjgHt6pKdGRxdgsVHobCwf5zQ/8JyOhn4=";
              sourceRoot = "${finalAttrs.src.name}/${pnpmRoot}";
            };

            buildPhase = ''
              export PNPM_WRITABLE_STORE=$(mktemp -d)
              cp -r ${pnpmDeps}/.* $PNPM_WRITABLE_STORE/ || true
              export npm_config_store_dir=$PNPM_WRITABLE_STORE
              cd telemetry && depot b --release && cd ..
              mdbook build
            '';
            installPhase = ''
              mkdir -p $out
              cp -R book/* $out
            '';
          });

          default = self.packages.${system}.activity-book;
        };

        devShell =
          with pkgs;
          mkShell {
            buildInputs = with pkgs; [
              cacert
              pnpm_9
              nodejs_22
              depotjs
              mdbookqz
              mdbook
              julia-bin
              sbclWithDeps
              wrk
              push-to-pages
            ];
          };
      }
    );
}
