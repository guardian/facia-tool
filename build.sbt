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

riffRaffPackageType := (packageBin in Debian).value
riffRaffBuildIdentifier := env("TRAVIS_BUILD_NUMBER").getOrElse("DEV")
riffRaffManifestBranch := branch().getOrElse(git.gitCurrentBranch.value)
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")

javacOptions := Seq("-g","-encoding", "utf8")

javaOptions in Universal ++= Seq(
    "-Dpidfile.path=/dev/null",
    "-J-XX:MaxRAMFraction=2",
    "-J-XX:InitialRAMFraction=2",
    "-J-XX:MaxMetaspaceSize=500m",
    "-J-XX:+PrintGCDetails",
    "-J-XX:+PrintGCDateStamps",
    s"-J-Xloggc:/var/log/${packageName.value}/gc.log"
)

routesGenerator := InjectedRoutesGenerator

scalacOptions := Seq("-unchecked", "-optimise", "-deprecation", "-target:jvm-1.8",
      "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings","-Xfatal-warnings")

sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false

TwirlKeys.templateImports ++= Seq(
    "conf._",
    "play.api.Play",
    "play.api.Play.current"
)

val awsVersion = "1.11.12"
val capiModelsVersion = "8.17"

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
    "com.gu" %% "fapi-client" % "2.0.0",
    "com.gu" % "kinesis-logback-appender" % "1.3.0",
    "com.gu" %% "mobile-notifications-client-play-2-4" % "0.5.28",
    "com.gu" %% "pan-domain-auth-play_2-4-0" % "0.3.0",
    "com.gu" %% "scanamo" % "0.6.0",
    "com.gu" %% "thrift-serializer" % "1.1.0",
    "net.logstash.logback" % "logstash-logback-encoder" % "4.7",
    "org.julienrf" %% "play-json-variants" % "2.0",
    "org.scalatest" %% "scalatest" % "2.2.6" % "test"
)

lazy val root = (project in file(".")).enablePlugins(PlayScala, RiffRaffArtifact, JDebPackaging)
