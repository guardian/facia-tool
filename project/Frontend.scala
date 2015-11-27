package com.gu

import com.gu.Dependencies._
import play.sbt.Play.autoImport._
import sbt.Keys._
import sbt._

object Frontend extends Build with Prototypes {

  val common = application("common").settings(
    libraryDependencies ++= Seq(
      awsCore,
      awsCloudwatch,
      awsKinesis,
      awsS3,
      awsSqs,
      awsSts,
      faciaFapiScalaClient,
      kinesisLogBack,
      logStash,
      panDomainAuth,
      playJsonVariants,
      scalaTestPlus,
      ws,
      filters,
      permissionClient
    )
  )

  def withTests(project: Project) = project % "test->test;compile->compile"

  val commonWithTests = withTests(common)

  val switchboard = application("switchboard").dependsOn(common)
  val faciaTool = application("facia-tool").dependsOn(commonWithTests, switchboard).aggregate(common)

  val main = root().aggregate(
    common,
    faciaTool
  )
}
