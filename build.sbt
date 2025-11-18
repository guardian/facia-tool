name := "facia-tool"

version := "1.0"

maintainer := "Editorial Tools Team <editorial.tools.dev@guardian.co.uk>"

packageSummary := "Facia tool"

packageDescription := "Guardian front pages editor"

ThisBuild / scalaVersion := "2.13.13"

import sbt.Resolver

debianPackageDependencies := Seq("java11-runtime-headless")

def env(key: String): Option[String] = Option(System.getenv(key))

ThisBuild / javacOptions := Seq("-g", "-encoding", "utf8")

Universal / javaOptions ++= Seq(
  "-Dpidfile.path=/dev/null",
  "-J-XX:MaxRAMFraction=2",
  "-J-XX:InitialRAMFraction=2",
  "-J-XX:MaxMetaspaceSize=500m",
  s"-J-Xloggc:/var/log/${packageName.value}/gc.log",
  "-Dcom.amazonaws.sdk.disableCbor"
)

routesGenerator := InjectedRoutesGenerator

scalacOptions := Seq(
  "-unchecked",
  "-deprecation",
  "-release:11",
  "-Xcheckinit",
  "-encoding",
  "utf8",
  "-feature"
)

Compile / doc / sources := Seq.empty

Compile / packageDoc / publishArtifact := false

TwirlKeys.templateImports ++= Seq(
  "conf._",
  "play.api.Play"
)

// include the enum path bindables
routesImport += "model.editions._"

val awsVersion = "1.12.470"
val capiModelsVersion = "31.0.0"
val capiClientVersion = "37.0.0"
val json4sVersion = "4.0.3"
val circeVersion = "0.13.0"

resolvers ++= Seq(
  Resolver.file("Local", file(Path.userHome.absolutePath + "/.ivy2/local"))(
    Resolver.ivyStylePatterns
  ),
  "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"
)

libraryDependencies ++= Seq(
  ws,
  filters,
  evolutions,
  jdbc,
  "com.amazonaws" % "aws-java-sdk-rds" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-core" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-s3" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-sns" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-sts" % awsVersion,
  "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion,
  "com.gu" %% "content-api-models-scala" % capiModelsVersion,
  "com.gu" %% "content-api-models-json" % capiModelsVersion,
  "com.gu" %% "content-api-client-aws" % "0.7.6",
  "com.gu" %% "content-api-client-default" % capiClientVersion,
  "com.gu" %% "editorial-permissions-client" % "3.0.0",
  "com.gu" %% "fapi-client-play30" % "23.0.0",
  "com.gu" %% "mobile-notifications-api-models" % "3.0.0",
  "com.gu" %% "pan-domain-auth-play_3-0" % "7.0.0",
  "org.scanamo" %% "scanamo" % "1.1.1" exclude (
    "org.scala-lang.modules",
    "scala-java8-compat_2.13"
  ),
  "com.github.blemale" %% "scaffeine" % "4.1.0" % "compile",
  "com.gu" %% "thrift-serializer" % "4.0.2",
  "net.logstash.logback" % "logstash-logback-encoder" % "6.6",
  "org.julienrf" %% "play-json-derived-codecs" % "11.0.0",
  "org.json4s" %% "json4s-native" % json4sVersion,
  "org.json4s" %% "json4s-jackson" % json4sVersion,
  "org.playframework" %% "play-json-joda" % "3.0.2",
  "ai.x" %% "play-json-extensions" % "0.40.2",
  "org.postgresql" % "postgresql" % "42.3.9",
  "org.scalikejdbc" %% "scalikejdbc" % "4.2.0",
  "org.scalikejdbc" %% "scalikejdbc-config" % "4.2.1",
  "org.scalikejdbc" %% "scalikejdbc-play-initializer" % "3.0.0-scalikejdbc-4.2",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "com.beachape" %% "enumeratum" % "1.7.3",
  "com.beachape" %% "enumeratum-play" % "1.8.0",
  "org.playframework" %% "play" % "3.0.2",
  "org.apache.commons" % "commons-text" % "1.10.0",
  "com.beust" % "jcommander" % "1.75",
  "org.scalatest" %% "scalatest" % "3.0.8" % "test",
  "org.mockito" % "mockito-core" % "5.11.0" % Test
)

excludeDependencies ++= Seq(
  // As of Play 3.0, groupId has changed to org.playframework; exclude transitive dependencies to the old artifacts
  // Hopefully this workaround can be removed once play-json-extensions either updates to Play 3.0 or is merged into play-json
  ExclusionRule(organization = "com.typesafe.play")
)

dependencyOverrides ++= Seq(
  // Pinned to resolve transitive dependencies between Play and Scalikejdbc
  "org.scala-lang.modules" %% "scala-parser-combinators" % "2.1.1"
)

val UsesDatabaseTest = config("database-int") extend Test

lazy val root = (project in file("."))
  .enablePlugins(PlayScala, JDebPackaging, SystemdPlugin, BuildInfoPlugin)
  .configs(UsesDatabaseTest)
  .settings(
    buildInfoPackage := "facia",
    buildInfoKeys := {
      Seq[BuildInfoKey](
        BuildInfoKey.constant(
          "buildNumber",
          env("GITHUB_BUILD_NUMBER").getOrElse("unknown")
        ),
        // so this next one is constant to avoid it always recompiling on dev machines.
        // we only really care about build time on teamcity, when a constant based on when
        // it was loaded is just fine
        BuildInfoKey.constant("buildTime", System.currentTimeMillis),
        BuildInfoKey
          .constant("gitCommitId", env("GITHUB_SHA").getOrElse("unknown"))
      )
    }
  )
  .settings(inConfig(UsesDatabaseTest)(Defaults.testTasks): _*)
  .settings(
    UsesDatabaseTest / testOptions := Seq(
      Tests.Argument(
        TestFrameworks.ScalaTest,
        // only include tests with this tag
        "-n",
        "fixtures.UsesDatabase",
        // show full stack traces when an exception is thrown
        "-oF"
      )
    )
  )
  // We exclude in other tests
  .settings(
    Test / testOptions := Seq(
      Tests.Argument(
        TestFrameworks.ScalaTest,
        // exclude tests tagged with UsesDatabase
        "-l",
        "fixtures.UsesDatabase",
        // show full stack traces when an exception is thrown
        "-oF"
      )
    )
  )
