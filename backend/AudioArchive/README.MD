# Usage
## Local Development
### For Nix Users
I use NixOS so I have Nix by default, but I think other linux distributions (and windows ?) can use it too. There's a flake on the project with all the dependencies but docker.
```bash
# Start development enviroment with nix
nix develop

# Create docker containers
docker compose up -d
```
>The LSP used is rosylyn-ls which only works with .NET 10+

## TODO
- Automatic tag deletion when the last audio assigned to it is deleted.
- Automatic artist deletion when the last audio assigned to it is deleted.
- New tag field: Description
- New artist field: Note (User's note about the artist)
