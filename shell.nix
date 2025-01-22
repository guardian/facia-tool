{ sources ? import ./nix/sources.nix }:
let pkgs = import sources.nixpkgs { };
in pkgs.mkShellNoCC {
  nativeBuildInputs = with pkgs;
    let
      sbtWithJava21 = sbt.override { jre = corretto21; };
      yarnWithNode20 = yarn.override { nodejs = nodejs_20; };
    in [ sbtWithJava21 metals yarnWithNode20 nodejs_18 ];
}
