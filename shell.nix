{ sources ? import ./nix/sources.nix }:
let
  pkgs = import sources.nixpkgs { };
  guardianNix = builtins.fetchGit {
    url = "git@github.com:guardian/guardian-nix.git";
    ref = "refs/tags/v1";
  };
  guardianDev = import "${guardianNix.outPath}/guardian-dev.nix" pkgs;

  sbtWithJava11 = pkgs.sbt.override { jre = pkgs.corretto11; };
  yarnWithNode20 = pkgs.yarn.override { nodejs = pkgs.nodejs_20; };
  frontsClient = pkgs.writeShellApplication {
    name = "fronts-client";
    runtimeInputs = [ yarnWithNode20 ];
    text = ''
      cd fronts-client
      yarn install
      yarn build
      yarn watch
    '';
  };
  startPlay = pkgs.writeShellApplication {
    name = "start-play";
    runtimeInputs = [ sbtWithJava11 ];
    text = ''
      export SBT_OPTS="-XX:+CMSClassUnloadingEnabled -Xmx4G -Xss4m"
      sbt "run"
    '';
  };
  buildV1 = pkgs.writeShellApplication {
    name = "build-v1";
    runtimeInputs = [ pkgs.nodejs_18 ];
    text = ''
      npm install
      npm run jspm install
    '';
  };
in guardianDev.devEnv {
  name = "facia-tool";
  commands = [ startPlay frontsClient buildV1 ];
  # in [
  #   metals
  # ];
}
