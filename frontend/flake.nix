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
          typescript-language-server
          nodePackages.vscode-langservers-extracted
        ];

        env = {
          NPM_CONFIG_CACHE = ".nix-shell/npm";
          NPM_CONFIG_PREFIX = ".nix-shell/npm-global";
          PATH = ".nix-shell/npm-global/bin:$PATH";
        };

        shellHook = ''
          export PKG_CONFIG_PATH="${pkgs.glib.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"
          mkdir -p .nix-shell/{cargo,rustup,npm,npm-global}
          export CARGO_HOME="$PWD/.nix-shell/cargo"
          export RUSTUP_HOME="$PWD/.nix-shell/rustup"
          echo "Development shell initialized"
        '';
      };
    });
}
