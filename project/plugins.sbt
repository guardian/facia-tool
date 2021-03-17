// Additional information on initialization
logLevel := Level.Warn

libraryDependencies += "org.vafer" % "jdeb" % "1.3" artifacts Artifact("jdeb", "jar", "jar")

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases"),
  Resolver.url("sbt-plugin-snapshots", new URL("https://repo.scala-sbt.org/scalasbt/sbt-plugin-snapshots/"))(Resolver.ivyStylePatterns),
  "Guardian Github Releases" at "https://guardian.github.com/maven/repo-releases",
  "Spy" at "https://files.couchbase.com/maven2/"
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.7.9")

addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "0.9.3")

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "1.1.9")

addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.1")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.9.0")
