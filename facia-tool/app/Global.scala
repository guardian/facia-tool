import java.io.File

import common._
import conf.{LogStashConfig, SwitchboardLifecycle, Gzipper}
import metrics.FrontendMetric
import permissions.ScheduledJob
import play.api._
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

import scala.util.control.NonFatal

object Global extends WithFilters(Gzipper)
  with GlobalSettings
  with CloudWatchApplicationMetrics
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with LogStashConfig {

  override lazy val applicationName = "frontend-facia-tool"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    FaciaToolMetrics.ApiUsageCount,
    FaciaToolMetrics.ProxyCount,
    FaciaToolMetrics.ContentApiPutFailure,
    FaciaToolMetrics.ContentApiPutSuccess,
    FaciaToolMetrics.DraftPublishCount,
    FaciaToolMetrics.ExpiredRequestCount,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    S3Metrics.S3ClientExceptionsMetric
  )
  
}
