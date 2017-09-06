name := "facia-tool"

version := "1.0"

maintainer := "CMS Fronts <aws-cms-fronts@theguardian.com>"

packageSummary := "Facia tool"

packageDescription := "Guardian front pages editor"

scalaVersion := "2.11.8"

import com.typesafe.sbt.packager.archetypes.ServerLoader.Systemd
serverLoading in Debian := Systemd

debianPackageDependencies := Seq("openjdk-8-jre-headless")

def env(key: String): Option[String] = Option(System.getenv(key))
def branch(): Option[String] = {
    env("TRAVIS_PULL_REQUEST") match {
        case Some("false") => env("TRAVIS_BRANCH")
        case _ => env("TRAVIS_PULL_REQUEST")
    }
}

riffRaffPackageName := s"cms-fronts::${name.value}"
riffRaffManifestProjectName := riffRaffPackageName.value
riffRaffBuildIdentifier := env("TRAVIS_BUILD_NUMBER").getOrElse("DEV")
riffRaffManifestBranch := branch().getOrElse(git.gitCurrentBranch.value)
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

scalacOptions := Seq("-unchecked", "-optimise", "-deprecation", "-target:jvm-1.8",
    "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings")

sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false

TwirlKeys.templateImports ++= Seq(
    "conf._",
    "play.api.Play",
    "play.api.Play.current"
)

val awsVersion = "1.11.188"
val capiModelsVersion = "11.12"
val circeVersion = "0.7.0"
val json4sVersion = "3.5.0"

val jacksonXmlExclusion = ExclusionRule(organization = "com.fasterxml.jackson")

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
    "com.gu" %% "auditing-thrift-model" % "0.2",
    "com.gu" % "content-api-models" % capiModelsVersion,
    "com.gu" % "content-api-models-json" % capiModelsVersion,
    "com.gu" %% "editorial-permissions-client" % "0.3",
    "com.gu" %% "fapi-client" % "2.0.14",
    "com.gu" % "kinesis-logback-appender" % "1.3.0",
    "com.gu" %% "mobile-notifications-client-play-2-4" % "0.5.29",
    "com.gu" %% "pan-domain-auth-play_2-4-0" % "0.3.0",

    // Circe 0.6.1 depends on Cats 0.8.1
    // content-api-models depends on Circe 0.6.1 which depends on Cats 0.8.1
    // Scanamo 0.8.3 depends on Cats 0.8.1
    // change with caution as must be upgraded in sync.

    "io.circe" %% "circe-core" % circeVersion,
    "io.circe" %% "circe-generic" % circeVersion,
    "io.circe" %% "circe-parser" % circeVersion,
    "com.gu" %% "scanamo" % "0.8.3",


    "com.gu" %% "thrift-serializer" % "1.1.0",
    "net.logstash.logback" % "logstash-logback-encoder" % "4.7",
    "org.julienrf" %% "play-json-variants" % "2.0",
    "org.json4s" %% "json4s-native" % json4sVersion,
    "org.json4s" %% "json4s-jackson" % json4sVersion,
    "org.scalatest" %% "scalatest" % "2.2.6" % "test"

)

lazy val root = (project in file(".")).enablePlugins(PlayScala, RiffRaffArtifact, JDebPackaging)

ivyLoggingLevel := UpdateLogging.Full
logLevel := Level.Debug
