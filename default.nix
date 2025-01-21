{ sources ? import ./nix/sources.nix }:
let
  sbt-derivation = import "${sources.sbt-derivation}/overlay.nix";
  pkgs = import sources.nixpkgs { overlays = [ sbt-derivation ]; };
in pkgs.mkSbtDerivation {
  pname = "facia-tool";
  version = "1.0.0";
  src = ./.;
  depsSha256 = "dr1ImRZ99J9ZwNfx6l+um/Ls64zQNdHDbFr0N2Gkses=";
  buildPhase = ''
    sbt "clean; assembly"
  '';
  installPhase = ''
    mkdir -p "$out"/bin
    cp target/scala-2.13/facia-tool-assembly-1.0.jar $out/bin/
  '';
  nativeBuildInputs = with pkgs; [ coreutils git ];
}
