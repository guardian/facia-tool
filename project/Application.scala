package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.SbtNativePackager._
import com.typesafe.sbt.packager.Keys._
import com.typesafe.sbt.packager.archetypes.ServerLoader.Systemd
import com.typesafe.sbt.packager.debian.JDebPackaging
import play.sbt.Play.autoImport._
import play.twirl.sbt.Import._
import sbt.Keys._
import sbt._

object Application extends Build {

  val frontendCompilationSettings = Seq(
    organization := "com.gu",
    maxErrors := 20,
    javacOptions := Seq("-g","-encoding", "utf8"),
    scalacOptions := Seq("-unchecked", "-optimise", "-deprecation", "-target:jvm-1.8",
      "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings","-Xfatal-warnings"),
    doc in Compile <<= target.map(_ / "none"),
    incOptions := incOptions.value.withNameHashing(true),
    scalaVersion := "2.11.7",
    initialize := {
      val _ = initialize.value
      assert(sys.props("java.specification.version") == "1.8",
        "Java 8 is required for this project.")
    },
    javaOptions in Universal ++= Seq(
      "-Dpidfile.path=/dev/null",
      "-J-XX:MaxRAMFraction=2",
      "-J-XX:InitialRAMFraction=2",
      "-J-XX:MaxMetaspaceSize=500m",
      "-J-XX:+PrintGCDetails",
      "-J-XX:+PrintGCDateStamps",
      s"-J-Xloggc:/var/log/${packageName.value}/gc.log"
    ),
    version := "1.0",
    licenses += ("Apache-2.0", url("http://www.apache.org/licenses/LICENSE-2.0.html"))
  )

  val faciaToolDescription = Seq(
    name := "facia-tool",
    packageSummary := "Facia tool",
    packageDescription := "Guardian front pages editor"
  )

  val storyPackagesDescription = Seq(
    name := "story-packages",
    packageSummary := "Story packages",
    packageDescription := "Guardian story packages editor"
  )

  val dependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
        <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
      </dependencies>,

    resolvers ++= Seq(
      Resolver.typesafeRepo("releases"),
      Resolver.sonatypeRepo("releases"),
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      "Spy" at "https://files.couchbase.com/maven2/"
    ),

    updateOptions := updateOptions.value.withCachedResolution(true),

    evictionWarningOptions in update := EvictionWarningOptions.default
      .withWarnTransitiveEvictions(false)
      .withWarnDirectEvictions(false)
      .withWarnScalaVersionEviction(false)
  )

  val clientSideSettings = Seq(

    TwirlKeys.templateImports ++= Seq(
      "model._",
      "views._",
      "conf._",
      "play.api.Play",
      "play.api.Play.current"
    )
  )

  val testSettings = Seq(
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    testOptions in Test := Nil,

    concurrentRestrictions in Global := List(Tags.limit(Tags.Test, 4)),

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= baseDirectory map { bd => Attributed.blank(bd / "test") },

    // These settings are needed for forking, which in turn is needed for concurrent restrictions.
    javaOptions in Test += "-DAPP_SECRET=this_is_not_a_real_secret_just_for_tests",
    javaOptions in Test += "-Xmx2048M",
    javaOptions in Test += "-XX:+UseConcMarkSweepGC",
    javaOptions in Test += "-XX:ReservedCodeCacheSize=128m",
    baseDirectory in Test := file(".")
  )

  def frontendDistSettings(application: String) = List(
    target := file("target/" + application).getAbsoluteFile,
    name in Universal := application,
    topLevelDirectory in Universal := Some(application),
    concurrentRestrictions in Universal := List(Tags.limit(Tags.All, 1)),
    serverLoading in Debian := Systemd,
    debianPackageDependencies := Seq("openjdk-8-jre-headless")
  )

  def project(name: String) = Project(name, base = file("facia-tool"))
    .enablePlugins(play.sbt.PlayScala, JDebPackaging)
    .settings(dependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(clientSideSettings)
    .settings(libraryDependencies
      ++= Dependencies.all
      ++ Seq(ws, filters)
    )
    .settings(testSettings)
    .settings(VersionInfo.settings)
    .settings(frontendDistSettings(name))

  val faciaTool = project("facia-tool").settings(faciaToolDescription)
  val storyPackages = project("packages").settings(storyPackagesDescription)
}
