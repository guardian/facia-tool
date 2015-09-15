name := "facia-tool"

version := "0.1-SNAPSHOT"

maintainer := "Max Smith <max.smith@yourcompany.io>"

packageSummary := "Hello World Debian Package"

packageDescription := """A fun package description of our software,
  with multiple lines."""

import com.typesafe.sbt.packager.archetypes.ServerLoader.Systemd
serverLoading in Rpm := Systemd
