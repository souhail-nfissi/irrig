{
  description = "A Nix-flake-based Python development environment";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit system; };
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            insomnia
            python311
            python311Packages.pip
            (python311.withPackages (ps: with ps; [
              fastapi
              fastapi-cli
              uvicorn
              sqlalchemy
              pydantic
              pydantic-scim
              pydantic-settings
              python-dotenv
              python-jose
              passlib
              python-multipart
              requests
            ]))
          ];
        };
      });
    };
}
