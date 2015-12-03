package com.gu

import sbt._

object Dependencies {
  val awsVersion = "1.10.37"

  val all = Seq(
    "com.amazonaws" % "aws-java-sdk-core" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-s3" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion,
    "com.amazonaws" % "aws-java-sdk-sts" % awsVersion,
    "commons-io" % "commons-io" % "2.4",
    "com.gu" %% "fapi-client" % "0.60",
    "com.gu" % "kinesis-logback-appender" % "1.1.0",
    "net.logstash.logback" % "logstash-logback-encoder" % "4.5.1",
    "com.gu" %% "pan-domain-auth-play_2-4-0" % "0.2.10",
    "org.julienrf" %% "play-json-variants" % "2.0",
    "org.scalatestplus" %% "play" % "1.4.0-M3" % "test",
    "com.gu" %% "editorial-permissions-client" % "0.2"
  )
}
