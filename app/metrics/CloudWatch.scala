package metrics

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.model._
import com.amazonaws.services.cloudwatch.{
  AmazonCloudWatchAsync,
  AmazonCloudWatchAsyncClientBuilder
}
import conf.ApplicationConfiguration
import logging.Logging
import services.AwsEndpoints

import scala.jdk.CollectionConverters._

class CloudWatch(
    val config: ApplicationConfiguration,
    val awsEndpoints: AwsEndpoints
) extends Logging {

  lazy val cloudwatch: Option[AmazonCloudWatchAsync] =
    config.aws.credentials.map(credentials => {
      val endpoint = new AwsClientBuilder.EndpointConfiguration(
        awsEndpoints.monitoring,
        config.aws.region
      )
      AmazonCloudWatchAsyncClientBuilder
        .standard()
        .withCredentials(credentials)
        .withEndpointConfiguration(endpoint)
        .build()
    })

  trait LoggingAsyncHandler
      extends AsyncHandler[PutMetricDataRequest, PutMetricDataResult] {
    def onError(exception: Exception): Unit = {
      logger.warn(
        s"CloudWatch PutMetricDataRequest error: ${exception.getMessage}}"
      )
    }
    def onSuccess(
        request: PutMetricDataRequest,
        result: PutMetricDataResult
    ): Unit = {}
  }

  case class AsyncHandlerForMetric(
      frontendStatisticSets: List[FrontendStatisticSet]
  ) extends LoggingAsyncHandler {
    override def onError(exception: Exception) = {
      logger.warn(
        s"Failed to put ${frontendStatisticSets.size} metrics: $exception"
      )
      logger.warn(
        s"Failed to put ${frontendStatisticSets.map(_.metric.name).mkString(",")}"
      )
      frontendStatisticSets.foreach { _.reset() }
      super.onError(exception)
    }
    override def onSuccess(
        request: PutMetricDataRequest,
        result: PutMetricDataResult
    ) = {
      super.onSuccess(request, result)
    }
  }

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
        new MetricDatum()
          .withStatisticValues(frontendMetricToStatisticSet(metricStatistic))
          .withUnit(metricStatistic.metric.metricUnit)
          .withMetricName(metricStatistic.metric.name)
          .withDimensions(dimensions.asJavaCollection)
      )
      val request = new PutMetricDataRequest()
        .withNamespace(metricNamespace)
        .withMetricData(metricsAsDatums.asJavaCollection)

      cloudwatch.foreach(
        _.putMetricDataAsync(
          request,
          AsyncHandlerForMetric(metricsAsStatistics)
        )
      )
    }
  }

  private def frontendMetricToStatisticSet(
      metricStatistics: FrontendStatisticSet
  ): StatisticSet =
    new StatisticSet()
      .withMaximum(metricStatistics.maximum)
      .withMinimum(metricStatistics.minimum)
      .withSampleCount(metricStatistics.sampleCount)
      .withSum(metricStatistics.sum)

}
