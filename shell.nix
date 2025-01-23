{ sources ? import ./nix/sources.nix }:
let pkgs = import sources.nixpkgs { };
in pkgs.mkShellNoCC {
  nativeBuildInputs = with pkgs;
    let
      sbtWithJava11 = sbt.override { jre = corretto11; };
      yarnWithNode20 = yarn.override { nodejs = nodejs_20; };
      frontsClient = writeShellApplication {
        name = "fronts-client";
        runtimeInputs = [ yarnWithNode20 ];
        text = ''
          cd fronts-client
          yarn install
          yarn build
          yarn watch
        '';
      };
      startPlay = writeShellApplication {
        name = "start-play";
        runtimeInputs = [ sbtWithJava11 ];
        text = ''
          export SBT_OPTS="-XX:+CMSClassUnloadingEnabled -Xmx4G -Xss4m"
          sbt "run"
        '';
      };
      buildV1 = writeShellApplication {
        name = "build-v1";
        runtimeInputs = [ nodejs_18 ];
        text = ''
          npm install
          npm run jspm install
        '';
      };
      runAllTmux = writeShellApplication {
        name = "run-all-tmux";
        runtimeInputs = [ tmux startPlay frontsClient buildV1 ];
        text = ''
          tmux new-session "start-play" ";" set-option remain-on-exit on ";" split-window -v "fronts-client" ";" split-window -h "build-v1"
        '';
      };

    in [
      sbtWithJava11
      metals
      yarnWithNode20
      nodejs_18
      tmux

      frontsClient
      startPlay
      buildV1
      runAllTmux
    ];
}
