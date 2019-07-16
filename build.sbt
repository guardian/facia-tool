name := "facia-tool"

version := "1.0"

maintainer := "Editorial Tools Team <editorial.tools.dev@guardian.co.uk>"

packageSummary := "Facia tool"

packageDescription := "Guardian front pages editor"

scalaVersion in ThisBuild := "2.12.5"

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
        (packageBin in Debian).value -> s"${name.value}/${name.value}_1.0_all.deb",
        baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml"
    ) ++ ((jsBundlesDir * "*") pair rebase(jsBundlesDir, "static-facia-tool"))
}

javacOptions in ThisBuild := Seq("-g","-encoding", "utf8")

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
val capiModelsVersion = "14.1"
val capiClientVersion = "14.3"
val json4sVersion = "3.6.0-M2"
val enumeratumPlayVersion = "1.5.13"
val circeVersion = "0.11.1"

resolvers ++= Seq(
    Resolver.file("Local", file( Path.userHome.absolutePath + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    "Guardian Mobile Bintray" at "https://dl.bintray.com/guardian/mobile",
    "Guardian Frontend Bintray" at "https://dl.bintray.com/guardian/frontend"
)


PlayKeys.devSettings := Seq("play.akka.dev-mode.akka.http.parsing.max-uri-length" -> "20480")

libraryDependencies ++= Seq(
    ws,
    filters,
    evolutions,
    jdbc,
    "com.amazonaws" % "aws-java-sdk-rds" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-core" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-s3" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sts" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion,
    "com.gu" %% "content-api-models" % capiModelsVersion,
    "com.gu" %% "content-api-models-json" % capiModelsVersion,
    "com.gu" %% "content-api-client-aws" % "0.5",
    "com.gu" %% "content-api-client-default" % capiClientVersion,
    "com.gu" %% "editorial-permissions-client" % "2.0",
    "com.gu" %% "fapi-client-play26" % "3.0.0",
    "com.gu" % "kinesis-logback-appender" % "1.4.2",
    "com.gu" %% "mobile-notifications-api-models" % "1.0.0",
    "com.gu" %% "pan-domain-auth-play_2-6" % "0.7.2",

    "com.gu" %% "scanamo" % "1.0.0-M7",

    "com.gu" %% "thrift-serializer" % "4.0.0",
    "net.logstash.logback" % "logstash-logback-encoder" % "5.0",
    "org.julienrf" %% "play-json-derived-codecs" % "4.0.0",
    "org.json4s" %% "json4s-native" % json4sVersion,
    "org.json4s" %% "json4s-jackson" % json4sVersion,
    "com.typesafe.play" %% "play-json-joda" % "2.6.9",

    "org.postgresql"           %  "postgresql"                   % "42.2.5",
    "org.scalikejdbc"          %% "scalikejdbc"                  % "3.1.0",
    "org.scalikejdbc"          %% "scalikejdbc-config"           % "3.1.0",
    "org.scalikejdbc"          %% "scalikejdbc-play-initializer" % "2.6.0-scalikejdbc-3.1",

    "io.circe"                 %% "circe-core"                   % circeVersion,
    "io.circe"                 %% "circe-generic"                % circeVersion,
    "io.circe"                 %% "circe-parser"                 % circeVersion,
    
    "com.beachape" %% "enumeratum" % enumeratumPlayVersion,
    "com.beachape" %% "enumeratum-play" % enumeratumPlayVersion,

    "org.scalatest" %% "scalatest" % "3.0.5" % "test",
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
    .settings(testOptions in UsesDatabaseTest := Seq(
        Tests.Argument(TestFrameworks.ScalaTest,
            // only include tests with this tag
            "-n", "fixtures.UsesDatabase",
            // show full stack traces when an exception is thrown
            "-oF"
        )
    ))
    // We exclude in other tests
    .settings(testOptions in Test := Seq(
        Tests.Argument(TestFrameworks.ScalaTest, 
            // exclude tests tagged with UsesDatabase
            "-l", "fixtures.UsesDatabase",
            // show full stack traces when an exception is thrown
            "-oF"
        )
    ))
