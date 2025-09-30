// Additional information on initialization
logLevel := Level.Warn

libraryDependencies += "org.vafer" % "jdeb" % "1.3" artifacts Artifact(
  "jdeb",
  "jar",
  "jar"
)

resolvers ++= Resolver.sonatypeOssRepos("releases")

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "1.0.2")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.13.1")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.2")
