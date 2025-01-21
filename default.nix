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
    sbt "clean; debian:packageBin"
  '';
  installPhase = ''
    mkdir -p "$out"/bin
    cp target/facia-tool_1.0_all.deb $out/bin/
  '';
  nativeBuildInputs = with pkgs; [ coreutils git ];
}
