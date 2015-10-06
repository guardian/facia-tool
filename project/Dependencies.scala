package com.gu

import sbt._

object Dependencies {
  val cucumberVersion = "1.1.5"
  val identityLibVersion = "3.46"
  val slf4jVersion = "1.7.5"
  val awsVersion = "1.9.16"

  val akkaAgent = "com.typesafe.akka" %% "akka-agent" % "2.3.4"
  val akkaContrib = "com.typesafe.akka" %% "akka-contrib" % "2.3.5"
  val apacheCommonsMath3 = "org.apache.commons" % "commons-math3" % "3.2"
  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsDynamodb = "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val awsSes = "com.amazonaws" % "aws-java-sdk-ses" % awsVersion
  val awsSns = "com.amazonaws" % "aws-java-sdk-sns" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsIo = "commons-io" % "commons-io" % "2.4"
  val contentApiClient = "com.gu" %% "content-api-client" % "6.6"
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "2.0.0"
  val dispatch = "net.databinder.dispatch" %% "dispatch-core" % "0.11.3"
  val dispatchTest = "net.databinder.dispatch" %% "dispatch-core" % "0.11.3" % Test
  val exactTargetClient = "com.gu" %% "exact-target-client" % "2.24"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client" % "0.56"
  val faciaScalaClient = "com.gu" %% "facia-json" % "0.56"
  val guardianConfiguration = "com.gu" %% "configuration" % "4.1"
  val jodaTime = "joda-time" % "joda-time" % "2.3"
  val jodaConvert = "org.joda" % "joda-convert" % "1.7"
  val jSoup = "org.jsoup" % "jsoup" % "1.7.3"
  val kinesisLogBack = "com.gu" % "kinesis-logback-appender" % "1.0.5"
  val logStash = "net.logstash.logback" % "logstash-logback-encoder" % "4.2"
  val playGoogleAuth = "com.gu" %% "play-googleauth" % "0.3.0"
  val panDomainAuth = "com.gu" %% "pan-domain-auth-play_2-4-0" % "0.2.6"
  val playJsonVariants = "org.julienrf" %% "play-json-variants" % "0.2"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.2.1"
  val scalajTime = "org.scalaj" % "scalaj-time_2.10.2" % "0.7"
  val scalaTest = "org.scalatest" %% "scalatest" % "2.2.1" % Test
  val scalaz = "org.scalaz" %% "scalaz-core" % "7.0.6"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % slf4jVersion
  val scalaTestPlus = "org.scalatestplus" %% "play" % "1.4.0-M3" % "test"
}
