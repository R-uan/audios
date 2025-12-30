{
  description = ".NET development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            dotnet-sdk_10
            netcoredbg # Debugger for .NET Core
            dotnet-ef
            roslyn-ls # LSP server for editors
          ];

          env = {
            DOTNET_ROOT = "${pkgs.dotnet-sdk_10}";
            PATH = "${pkgs.dotnet-sdk_10}/bin:${pkgs.dotnet-ef}/bin:${pkgs.netcoredbg}/bin:$PATH";
          };

          shellHook = ''
            echo "🚀 .NET Development Environment"
          '';
        };
      }
    );
}
