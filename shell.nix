{ sources ? import ./nix/sources.nix }:
let pkgs = import sources.nixpkgs { };
in pkgs.mkShellNoCC {
  # To run the tests, provide a capi URL and key:
  # CAPI_URL = "https://content.code.dev-guardianapis.com/";
  # CAPI_KEY = "<your-key-here>";

  # To capture junit XML output from the tests, set an output folder:
  # SBT_JUNIT_OUTPUT = "junit-tests";

  nativeBuildInputs = with pkgs;
    let sbtWithJava11 = sbt.override { jre = corretto11; };
    in [ sbtWithJava11 metals ];
}
