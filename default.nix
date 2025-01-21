{ sources ? import ./nix/sources.nix }:
let
  sbt-derivation = import "${sources.sbt-derivation}/overlay.nix";
  pkgs = import sources.nixpkgs { overlays = [ sbt-derivation ]; };
in pkgs.mkSbtDerivation {
  # To run the tests, provide a capi URL and key:
  # CAPI_URL = "https://content.code.dev-guardianapis.com/";
  # CAPI_KEY = "<your-key-here>";

  # To capture junit XML output from the tests, set an output folder:
  # SBT_JUNIT_OUTPUT = "junit-tests";

  nativeBuildInputs = with pkgs;
    let sbtWithJava11 = sbt.override { jre = corretto11; };
    in [ sbtWithJava11 metals ];
}
