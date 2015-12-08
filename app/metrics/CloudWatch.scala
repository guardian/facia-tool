package metrics

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import conf.{Configuration, aws}
import play.api.Logger
import services.AwsEndpoints

import scala.collection.JavaConversions._

trait CloudWatch {

  lazy val stageDimension = new Dimension().withName("Stage").withValue(Configuration.environment.stage)

  lazy val cloudwatch: Option[AmazonCloudWatchAsyncClient] = aws.credentials.map{ credentials =>
    val client = new AmazonCloudWatchAsyncClient(credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  trait LoggingAsyncHandler extends AsyncHandler[PutMetricDataRequest, Void] {
    def onError(exception: Exception)
    {
      Logger.info(s"CloudWatch PutMetricDataRequest error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutMetricDataRequest, result: Void )
    {
      Logger.info("CloudWatch PutMetricDataRequest - success")
    }
  }

  object LoggingAsyncHandler extends LoggingAsyncHandler

  case class AsyncHandlerForMetric(frontendStatisticSets: List[FrontendStatisticSet]) extends LoggingAsyncHandler {
    override def onError(exception: Exception) = {
      Logger.warn(s"Failed to put ${frontendStatisticSets.size} metrics: $exception")
      Logger.warn(s"Failed to put ${frontendStatisticSets.map(_.metric.name).mkString(",")}")
      frontendStatisticSets.foreach { _.reset() }
      super.onError(exception)
    }
    override def onSuccess(request: PutMetricDataRequest, result: Void ) = {
      Logger.info(s"Successfully put ${frontendStatisticSets.size} metrics")
      Logger.info(s"Successfully put ${frontendStatisticSets.map(_.metric.name).mkString(",")}")

      super.onSuccess(request, result)
    }
  }

  def put(namespace: String, metrics: Map[String, Double], dimensions: Seq[Dimension]): Any = {
    val request = new PutMetricDataRequest().
      withNamespace(namespace).
      withMetricData(metrics.map{ case (name, count) =>
      new MetricDatum()
        .withValue(count)
        .withMetricName(name)
        .withUnit("Count")
        .withDimensions(dimensions)
    })

    cloudwatch.foreach(_.putMetricDataAsync(request, LoggingAsyncHandler))
  }

  def putMetricsWithStage(metrics: List[FrontendMetric], applicationDimension: Dimension): Unit =
    putMetrics("Application", metrics, List(stageDimension, applicationDimension))

  def putMetrics(metricNamespace: String, metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    for {
      metricGroup <- metrics.filterNot(_.isEmpty).grouped(20)
    } {
      val metricsAsStatistics: List[FrontendStatisticSet] =
        metricGroup.map( metric => FrontendStatisticSet(metric, metric.getAndResetDataPoints))
      val request = new PutMetricDataRequest()
        .withNamespace(metricNamespace)
        .withMetricData {
          for(metricStatistic <- metricsAsStatistics) yield {
            new MetricDatum()
              .withStatisticValues(frontendMetricToStatisticSet(metricStatistic))
              .withUnit(metricStatistic.metric.metricUnit)
              .withMetricName(metricStatistic.metric.name)
              .withDimensions(dimensions)
          }
        }
      CloudWatch.cloudwatch.foreach(_.putMetricDataAsync(request, AsyncHandlerForMetric(metricsAsStatistics)))
    }
  }

  private def frontendMetricToStatisticSet(metricStatistics: FrontendStatisticSet): StatisticSet =
    new StatisticSet()
      .withMaximum(metricStatistics.maximum)
      .withMinimum(metricStatistics.minimum)
      .withSampleCount(metricStatistics.sampleCount)
      .withSum(metricStatistics.sum)

}

object CloudWatch extends CloudWatch
