{
  description = "Node.js dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.bun
          pkgs.prettier
          pkgs.nodejs_20
          pkgs.nodePackages.sass
          pkgs.typescript-language-server
          pkgs.vscode-css-languageserver
          pkgs.nodePackages.vscode-langservers-extracted
        ];

        shellHook = ''
          echo "Node $(node -v) ready. Try not to break anything."
        '';
      };
    });
}
