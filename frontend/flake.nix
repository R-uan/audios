{
  description = "Bun enviroment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    flake-utils,
    nixpkgs,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          bun
          prettier
          vscode-css-languageserver
          nodePackages.vscode-langservers-extracted
          nodePackages.sass
          typescript-language-server
        ];

        env = {
          NPM_CONFIG_CACHE = ".nix-shell/npm";
          NPM_CONFIG_PREFIX = ".nix-shell/npm-global";
          PATH = ".nix-shell/npm-global/bin:$PATH";
        };

        shellHook = ''
          mkdir -p .nix-shell/{npm,npm-global}
          echo "Development shell initialized"
        '';
      };
    });
}
