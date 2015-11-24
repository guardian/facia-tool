import switchboard.{Lifecycle => NewSwitchboardLifecycle}
import conf.{PermissionsCache, LogStashConfig}
import metrics.{FrontendMetric, CloudWatchApplicationMetrics, FaciaToolMetrics, S3Metrics}
import play.api._
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Gzipper)
  with GlobalSettings
  with CloudWatchApplicationMetrics
  with ConfigAgentLifecycle
  with NewSwitchboardLifecycle
  with LogStashConfig
  with PermissionsCache {

  override lazy val applicationName = "frontend-facia-tool"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    FaciaToolMetrics.ApiUsageCount,
    FaciaToolMetrics.ProxyCount,
    FaciaToolMetrics.DraftPublishCount,
    FaciaToolMetrics.EnqueuePressSuccess,
    FaciaToolMetrics.EnqueuePressFailure,
    S3Metrics.S3ClientExceptionsMetric
  )

}
