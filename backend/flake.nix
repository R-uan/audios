{
  description = "Audio Archive";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {flake-utils, nixpkgs, ... }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          dotnet-sdk_10
          netcoredbg
          dotnet-ef
          roslyn-ls
        ];

        env = {
        };      

        shellHook = ''
          mkdir -p .nix-shell/{dotnet,nuget}
          export NUGET_PACKAGES="$PWD/.nix-shell/nuget"
          export DOTNET_CLI_HOME="$PWD/.nix-shell/dotnet"
          echo "Development shell initialized"
        '';
      };
    });
}
