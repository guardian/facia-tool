name := "facia-tool"

version := "1.0"

maintainer := "Editorial Tools Team <editorial.tools.dev@guardian.co.uk>"

packageSummary := "Facia tool"

packageDescription := "Guardian front pages editor"

ThisBuild / scalaVersion := "2.13.5"

import com.gu.riffraff.artifact.BuildInfo
import sbt.Resolver
import sbt.io.Path._

debianPackageDependencies := Seq("openjdk-8-jre-headless")

def env(key: String): Option[String] = Option(System.getenv(key))

riffRaffPackageName := s"cms-fronts::${name.value}"
riffRaffManifestProjectName := riffRaffPackageName.value
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffArtifactResources := {
    val jsBundlesDir = baseDirectory.value / "tmp" / "bundles"
    Seq(
        (Debian / packageBin).value -> s"${name.value}/${name.value}_1.0_all.deb",
        baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml",
        baseDirectory.value / "fluentbit/td-agent-bit.conf" -> "facia-tool/fluentbit/td-agent-bit.conf",
        baseDirectory.value / "fluentbit/parsers.conf" -> "facia-tool/fluentbit/parsers.conf"
    ) ++ ((jsBundlesDir * "*") pair rebase(jsBundlesDir, "static-facia-tool"))
}

ThisBuild / javacOptions := Seq("-g","-encoding", "utf8")

Universal / javaOptions ++= Seq(
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

Compile / doc / sources := Seq.empty

Compile / packageDoc / publishArtifact := false

TwirlKeys.templateImports ++= Seq(
    "conf._",
    "play.api.Play"
)

// include the enum path bindables
routesImport += "model.editions._"

val awsVersion = "1.11.999"
val capiModelsVersion = "17.1.0"
val capiClientVersion = "19.0.5"
val json4sVersion = "4.0.3"
val enumeratumPlayVersion = "1.6.0"
val circeVersion = "0.13.0"

resolvers ++= Seq(
    Resolver.file("Local", file( Path.userHome.absolutePath + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"
)


PlayKeys.devSettings := Seq("play.akka.dev-mode.akka.http.parsing.max-uri-length" -> "20480")

libraryDependencies ++= Seq(
    ws,
    filters,
    evolutions,
    jdbc,
    "com.typesafe.akka" %% "akka-agent" % "2.5.23",
    "com.amazonaws" % "aws-java-sdk-rds" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-core" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-s3" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sts" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion,
    "com.gu" %% "content-api-models-scala" % capiModelsVersion,
    "com.gu" %% "content-api-models-json" % capiModelsVersion,
    "com.gu" %% "content-api-client-aws" % "0.6",
    "com.gu" %% "content-api-client-default" % capiClientVersion,
    "com.gu" %% "editorial-permissions-client" % "2.9",
    "com.gu" %% "fapi-client-play28" % "4.0.3",
    "com.gu" %% "mobile-notifications-api-models" % "1.0.14",
    "com.gu" %% "pan-domain-auth-play_2-8" % "1.1.1",

    "org.scanamo" %% "scanamo" % "1.0.0-M15" exclude("org.scala-lang.modules", "scala-java8-compat_2.13"),
    "com.github.blemale" %% "scaffeine" % "4.1.0" % "compile",

    "com.gu" %% "thrift-serializer" % "4.0.2",
    "net.logstash.logback" % "logstash-logback-encoder" % "6.6",
    "org.julienrf" %% "play-json-derived-codecs" % "5.0.0",
    "org.json4s" %% "json4s-native" % json4sVersion,
    "org.json4s" %% "json4s-jackson" % json4sVersion,
    "com.typesafe.play" %% "play-json-joda" % "2.9.2",
    "ai.x" %% "play-json-extensions" % "0.40.2",

    "org.postgresql"           %  "postgresql"                   % "42.2.5",
    "org.scalikejdbc"          %% "scalikejdbc"                  % "3.3.5",
    "org.scalikejdbc"          %% "scalikejdbc-config"           % "3.3.5",
    "org.scalikejdbc"          %% "scalikejdbc-play-initializer" % "2.8.0-scalikejdbc-3.5",

    "io.circe"                 %% "circe-core"                   % circeVersion,
    "io.circe"                 %% "circe-generic"                % circeVersion,
    "io.circe"                 %% "circe-parser"                 % circeVersion,

    "com.beachape" %% "enumeratum" % enumeratumPlayVersion,
    "com.beachape" %% "enumeratum-play" % enumeratumPlayVersion,
    "com.typesafe.play" %% "play" % "2.8.2",

    "org.apache.commons" % "commons-text" % "1.9",
    "com.beust" % "jcommander" % "1.75",

    "org.scalatest" %% "scalatest" % "3.0.8" % "test",
    "com.whisk" %% "docker-testkit-scalatest" % "0.9.9" % "test",
    "com.whisk" %% "docker-testkit-impl-docker-java" % "0.9.9" % "test"
)

val UsesDatabaseTest = config("database-int") extend Test

lazy val root = (project in file("."))
    .enablePlugins(PlayScala, RiffRaffArtifact, JDebPackaging, SystemdPlugin, BuildInfoPlugin)
    .configs(UsesDatabaseTest)
    .settings(
        buildInfoPackage := "facia",
        buildInfoKeys := {
            lazy val buildInfo = BuildInfo(baseDirectory.value)
            Seq[BuildInfoKey](
                BuildInfoKey.constant("buildNumber", buildInfo.buildIdentifier),
                // so this next one is constant to avoid it always recompiling on dev machines.
                // we only really care about build time on teamcity, when a constant based on when
                // it was loaded is just fine
                BuildInfoKey.constant("buildTime", System.currentTimeMillis),
                BuildInfoKey.constant("gitCommitId", buildInfo.revision)
            )
        }
    )
    .settings(inConfig(UsesDatabaseTest)(Defaults.testTasks): _*)
    .settings(UsesDatabaseTest / testOptions := Seq(
        Tests.Argument(TestFrameworks.ScalaTest,
            // only include tests with this tag
            "-n", "fixtures.UsesDatabase",
            // show full stack traces when an exception is thrown
            "-oF"
        )
    ))
    // We exclude in other tests
    .settings(Test / testOptions := Seq(
        Tests.Argument(TestFrameworks.ScalaTest,
            // exclude tests tagged with UsesDatabase
            "-l", "fixtures.UsesDatabase",
            // show full stack traces when an exception is thrown
            "-oF"
        )
    ))
