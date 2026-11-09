// Additional information on initialization
logLevel := Level.Warn

libraryDependencies += "org.vafer" % "jdeb" % "1.14" artifacts Artifact(
  "jdeb",
  "jar",
  "jar"
)

resolvers ++= Resolver.sonatypeOssRepos("releases")

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "0.9.3")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.9.0")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.2")
