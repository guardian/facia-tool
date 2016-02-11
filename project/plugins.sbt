// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases"),
  Resolver.url("sbt-plugin-snapshots", new URL("http://repo.scala-sbt.org/scalasbt/sbt-plugin-snapshots/"))(Resolver.ivyStylePatterns),
  "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
  "Spy" at "https://files.couchbase.com/maven2/"
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.4.4")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.0.3")

addSbtPlugin("org.jetbrains.teamcity.plugins" % "sbt-teamcity-logger" % "0.2.0")

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "0.8.3")
