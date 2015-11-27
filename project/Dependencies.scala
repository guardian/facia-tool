package com.gu

import sbt._

object Dependencies {
  val awsVersion = "1.10.37"

  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsSts = "com.amazonaws" % "aws-java-sdk-sts" % awsVersion
  val commonsIo = "commons-io" % "commons-io" % "2.4"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client" % "0.60"
  val kinesisLogBack = "com.gu" % "kinesis-logback-appender" % "1.1.0"
  val logStash = "net.logstash.logback" % "logstash-logback-encoder" % "4.5.1"
  val panDomainAuth = "com.gu" %% "pan-domain-auth-play_2-4-0" % "0.2.10"
  val playJsonVariants = "org.julienrf" %% "play-json-variants" % "2.0"
  val scalaTestPlus = "org.scalatestplus" %% "play" % "1.4.0-M3" % "test"
  val permissionClient = "com.gu" %% "editorial-permissions-client" % "0.2"
}
