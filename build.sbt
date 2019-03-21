name := "facia-tool"

version := "1.0"

maintainer := "Editorial Tools Team <editorial.tools.dev@guardian.co.uk>"

packageSummary := "Facia tool"

packageDescription := "Guardian front pages editor"

scalaVersion := "2.12.5"

import sbt.Resolver
import sbt.io.Path._

debianPackageDependencies := Seq("openjdk-8-jre-headless")

def env(key: String): Option[String] = Option(System.getenv(key))

riffRaffPackageName := s"cms-fronts::${name.value}"
riffRaffManifestProjectName := riffRaffPackageName.value
riffRaffBuildIdentifier := env("BUILD_NUMBER").getOrElse("DEV")
riffRaffManifestBranch := env("GIT_BRANCH").getOrElse(git.gitCurrentBranch.value)
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffArtifactResources := {
    val jsBundlesDir = baseDirectory.value / "tmp" / "bundles"
    Seq(
        (packageBin in Debian).value -> s"${name.value}/${name.value}_1.0_all.deb",
        baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml"
    ) ++ ((jsBundlesDir * "*") pair rebase(jsBundlesDir, "static-facia-tool"))
}

javacOptions := Seq("-g","-encoding", "utf8")

javaOptions in Universal ++= Seq(
    "-Dpidfile.path=/dev/null",
    "-J-XX:MaxRAMFraction=2",
    "-J-XX:InitialRAMFraction=2",
    "-J-XX:MaxMetaspaceSize=500m",
    "-J-XX:+PrintGCDetails",
    "-J-XX:+PrintGCDateStamps",
    s"-J-Xloggc:/var/log/${packageName.value}/gc.log",
    "-Dcom.amazonaws.sdk.disableCbor"
)

routesGenerator := InjectedRoutesGenerator

scalacOptions := Seq("-unchecked", "-deprecation", "-target:jvm-1.8", "-Xcheckinit", "-encoding", "utf8", "-feature")

sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false

TwirlKeys.templateImports ++= Seq(
    "conf._",
    "play.api.Play",
    "play.api.Play.current"
)

val awsVersion = "1.11.293"
val capiModelsVersion = "12.10"
val json4sVersion = "3.6.0-M2"

resolvers ++= Seq(
    Resolver.file("Local", file( Path.userHome.absolutePath + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    "Guardian Mobile Bintray" at "https://dl.bintray.com/guardian/mobile",
    "Guardian Frontend Bintray" at "https://dl.bintray.com/guardian/frontend"
)


PlayKeys.devSettings := Seq("play.akka.dev-mode.akka.http.parsing.max-uri-length" -> "20480")

libraryDependencies ++= Seq(
    ws,
    filters,
    "com.amazonaws" % "aws-java-sdk-core" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-s3" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sts" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion,
    "com.gu" %% "content-api-models" % capiModelsVersion,
    "com.gu" %% "content-api-models-json" % capiModelsVersion,
    "com.gu" %% "content-api-client-aws" % "0.5",
    "com.gu" %% "editorial-permissions-client" % "2.0",
    "com.gu" %% "fapi-client-play26" % "2.6.6",
    "com.gu" % "kinesis-logback-appender" % "1.4.2",
    "com.gu" %% "mobile-notifications-client" % "1.5",
    "com.gu" %% "pan-domain-auth-play_2-6" % "0.7.2",

    "com.gu" %% "scanamo" % "1.0.0-M7",

    "com.gu" %% "thrift-serializer" % "2.1.0",
    "net.logstash.logback" % "logstash-logback-encoder" % "5.0",
    "org.julienrf" %% "play-json-derived-codecs" % "4.0.0",
    "org.json4s" %% "json4s-native" % json4sVersion,
    "org.json4s" %% "json4s-jackson" % json4sVersion,
    "org.scalatest" %% "scalatest" % "3.0.5" % "test",
    "com.typesafe.play" %% "play-json-joda" % "2.6.9"

)

lazy val root = (project in file(".")).enablePlugins(PlayScala, RiffRaffArtifact, JDebPackaging, SystemdPlugin)
