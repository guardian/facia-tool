{ sources ? import ./nix/sources.nix }:
let pkgs = import sources.nixpkgs { };
in pkgs.mkShellNoCC {
  nativeBuildInputs = with pkgs;
    let
      sbtWithJava21 = sbt.override { jre = corretto21; };
      fronts-client = mkYarnPackage {
        name = "fronts-client";
        src = ./fronts-client;
        packageJSON = ./fronts-client/package.json;
        yarnLock = ./fronts-client/yarn.lock;
        yarnNix = ./fronts-client/fronts-client.nix;
      };
    in [ sbtWithJava21 metals fronts-client ];
}
