package metrics

import conf.ApplicationConfiguration
import logging.Logging
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient
import software.amazon.awssdk.services.cloudwatch.model.{
  Dimension,
  MetricDatum,
  PutMetricDataRequest,
  StatisticSet
}

import scala.jdk.CollectionConverters._

class CloudWatch(
    val config: ApplicationConfiguration
) extends Logging {

  lazy val cloudwatch: Option[CloudWatchAsyncClient] =
    config.aws.newStyleCredentials.map(credentials =>
      CloudWatchAsyncClient
        .builder()
        .credentialsProvider(credentials)
        .region(Region.of(config.aws.region))
        .build()
    )

  def putMetricsWithStage(
      metrics: List[FrontendMetric],
      applicationDimension: Dimension,
      stageDimension: Dimension
  ): Unit =
    putMetrics(
      "Application",
      metrics,
      List(stageDimension, applicationDimension)
    )

  def putMetrics(
      metricNamespace: String,
      metrics: List[FrontendMetric],
      dimensions: List[Dimension]
  ): Unit = {
    for {
      metricGroup <- metrics.filterNot(_.isEmpty).grouped(20)
    } {
      val metricsAsStatistics: List[FrontendStatisticSet] =
        metricGroup.map(metric =>
          FrontendStatisticSet(metric, metric.getAndResetDataPoints)
        )
      val metricsAsDatums = metricsAsStatistics.map(metricStatistic =>
        MetricDatum
          .builder()
          .statisticValues(frontendMetricToStatisticSet(metricStatistic))
          .unit(metricStatistic.metric.metricUnit)
          .metricName(metricStatistic.metric.name)
          .dimensions(dimensions.asJavaCollection)
          .build()
      )
      val request = PutMetricDataRequest
        .builder()
        .namespace(metricNamespace)
        .metricData(metricsAsDatums.asJavaCollection)
        .build()

      cloudwatch.foreach { client =>
        client.putMetricData(request).whenComplete { (_, exception) =>
          if (exception != null) {
            logger.warn(
              s"Failed to put ${metricsAsStatistics.size} metrics: $exception"
            )
            logger.warn(
              s"Failed to put ${metricsAsStatistics.map(_.metric.name).mkString(",")}"
            )
            metricsAsStatistics.foreach(_.reset())
          }
        }
      }
    }
  }

  private def frontendMetricToStatisticSet(
      metricStatistics: FrontendStatisticSet
  ): StatisticSet =
    StatisticSet
      .builder()
      .maximum(metricStatistics.maximum)
      .minimum(metricStatistics.minimum)
      .sampleCount(metricStatistics.sampleCount)
      .sum(metricStatistics.sum)
      .build()

}
