package com.gu

import sbt._
import sbt.Keys._
import play.Play.autoImport._
import PlayKeys._
import play._
import play.sbt._
import play.sbt.routes.RoutesKeys
import play.twirl.sbt.Import._
import com.typesafe.sbt.web.Import._
import Dependencies._

object Frontend extends Build with Prototypes {

  val common = application("common").settings(
    libraryDependencies ++= Seq(
      akkaAgent,
      apacheCommonsMath3,
      awsCore,
      awsCloudwatch,
      awsDynamodb,
      awsS3,
      awsSns,
      awsSqs,
      contentApiClient,
      faciaScalaClient,
      filters,
      flexibleContentBlockToText,
      flexibleContentBodyParser,
      googleSheetsApi,
      guardianConfiguration,
      jacksonCore,
      jacksonMapper,
      jSoup,
      liftJson,
      playGoogleAuth,
      panDomainAuth,
      quartzScheduler,
      rome,
      romeModules,
      scalaCheck,
      scalajTime,
      scalaTestPlus,
      scalaz,
      shadeMemcached,
      snappyJava,
      ws,
      faciaFapiScalaClient,
      dispatchTest
    )
  ).settings(
      mappings in TestAssets ~= filterAssets
  )

  private def filterAssets(testAssets: Seq[(File, String)]) = testAssets.filterNot{ case (file, fileName) =>
    // built in sbt plugins did not like the bower files
    fileName.endsWith("bower.json")
  }

  def withTests(project: Project) = project % "test->test;compile->compile"

  val commonWithTests = withTests(common)

  val faciaTool = application("facia-tool").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      playJsonVariants,
      awsKinesis,
      logStash,
      kinesisLogBack
    )
  )

  val main = root().aggregate(
    common,
    faciaTool
  )
}
