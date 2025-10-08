{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    depot-js.url = "github:cognitive-engineering-lab/depot";
    mdbook-quiz.url = "github:cognitive-engineering-lab/mdbook-quiz";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay, depot-js, mdbook-quiz }:
    flake-utils.lib.eachDefaultSystem (system:
      let 
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; }; 
        depotjs = depot-js.packages.${system}.default;
        mdbookqz = mdbook-quiz.packages.${system}.default;

        activity-book = pkgs.stdenv.mkDerivation {
          pname = "tutorial-book";
          version = "0.1.0";
          src = pkgs.lib.cleanSource ./.;
          buildInputs = with pkgs; [
            pnpm_9
            nodejs_22
            depotjs
            python3
            mdbookqz
            mdbook
          ];
          buildPhase = ''
            cd telemetry && depot b --release && cd ..
            mdbook build
          '';
          installPhase = ''
            mkdir -p $out
            cp -R book/* $out
          '';
        };
      in {
        packages.default = activity-book;
      });
}
