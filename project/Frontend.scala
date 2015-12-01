package com.gu

import com.gu.Dependencies._
import play.sbt.Play.autoImport._
import sbt.Keys._
import sbt._

object Frontend extends Build with Prototypes {

  val faciaTool = application("facia-tool").settings(
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

  val main = root().aggregate(faciaTool)
}
