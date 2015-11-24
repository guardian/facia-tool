package metrics

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit}
import common.{Jobs, ManifestData}
import play.Play
import play.api.{Application => PlayApp, GlobalSettings}

import scala.collection.JavaConversions._

object SystemMetrics extends implicits.Numbers {

  class GcRateMetric(bean: GarbageCollectorMXBean) {
    private val lastGcCount = new AtomicLong(0)
    private val lastGcTime = new AtomicLong(0)

    lazy val name = bean.getName.replace(" ", "_")

    def gcCount: Double = {
      val totalGcCount = bean.getCollectionCount
      totalGcCount - lastGcCount.getAndSet(totalGcCount)
    }

    def gcTime: Double = {
      val totalGcTime = bean.getCollectionTime
      totalGcTime - lastGcTime.getAndSet(totalGcTime)
    }
  }


  lazy val garbageCollectors: Seq[GcRateMetric] = ManagementFactory.getGarbageCollectorMXBeans.map(new GcRateMetric(_))


  // divide by 1048576 to convert bytes to MB

  object MaxHeapMemoryMetric extends GaugeMetric("max-heap-memory", "Max heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax / 1048576
  )

  object UsedHeapMemoryMetric extends GaugeMetric("used-heap-memory", "Used heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed / 1048576
  )

  object MaxNonHeapMemoryMetric extends GaugeMetric("max-non-heap-memory", "Max non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax / 1048576
  )

  object UsedNonHeapMemoryMetric extends GaugeMetric("used-non-heap-memory", "Used non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed / 1048576
  )

  object AvailableProcessorsMetric extends GaugeMetric("available-processors", "Available processors",
    () => ManagementFactory.getOperatingSystemMXBean.getAvailableProcessors
  )

  object FreeDiskSpaceMetric extends GaugeMetric("free-disk-space", "Free disk space (MB)",
    () => new File("/").getUsableSpace / 1048576
  )

  object TotalDiskSpaceMetric extends GaugeMetric("total-disk-space", "Total disk space (MB)",
    () => new File("/").getTotalSpace / 1048576
  )

  // yeah, casting to com.sun.. ain't too pretty
  object TotalPhysicalMemoryMetric extends GaugeMetric("total-physical-memory", "Total physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getTotalPhysicalMemorySize
      case _ => -1
    }
  )

  object FreePhysicalMemoryMetric extends GaugeMetric("free-physical-memory", "Free physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getFreePhysicalMemorySize
      case _ => -1
    }
  )

  object OpenFileDescriptorsMetric extends GaugeMetric("open-file-descriptors", "Open file descriptors",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.UnixOperatingSystemMXBean => b.getOpenFileDescriptorCount
      case _ => -1
    }
  )

  object MaxFileDescriptorsMetric extends GaugeMetric("max-file-descriptors", "Max file descriptors",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.UnixOperatingSystemMXBean => b.getMaxFileDescriptorCount
      case _ => -1
    }
  )

  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _ => -1 // dev machines do not have a build number
  }

  object BuildNumberMetric extends GaugeMetric("build-number", "Build number",
    () => buildNumber,
    StandardUnit.None
  )
}

object S3Metrics {
  object S3ClientExceptionsMetric extends CountMetric(
    "s3-client-exceptions",
    "Number of times the AWS S3 client has thrown an Exception"
  )
}

object FaciaToolMetrics {
  object ApiUsageCount extends CountMetric(
    "api-usage",
    "Number of requests to the Facia API from clients (The tool)"
  )

  object ProxyCount extends CountMetric(
    "api-proxy-usage",
    "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
  )

  object DraftPublishCount extends CountMetric(
    "draft-publish",
    "Number of drafts that have been published"
  )

  object EnqueuePressSuccess extends CountMetric(
    "faciatool-enqueue-press-success",
    "Number of successful enqueuing of press commands"
  )

  object EnqueuePressFailure extends CountMetric(
    "faciatool-enqueue-press-failure",
    "Number of failed enqueuing of press commands"
  )
}

trait CloudWatchApplicationMetrics extends GlobalSettings {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension = new Dimension().withName("ApplicationName").withValue(applicationName)
  def applicationName: String
  def applicationMetrics: List[FrontendMetric] = Nil

  def systemMetrics: List[FrontendMetric] = List(SystemMetrics.MaxHeapMemoryMetric,
    SystemMetrics.UsedHeapMemoryMetric, SystemMetrics.TotalPhysicalMemoryMetric, SystemMetrics.FreePhysicalMemoryMetric,
    SystemMetrics.AvailableProcessorsMetric, SystemMetrics.BuildNumberMetric, SystemMetrics.FreeDiskSpaceMetric,
    SystemMetrics.TotalDiskSpaceMetric, SystemMetrics.MaxFileDescriptorsMetric,
    SystemMetrics.OpenFileDescriptorsMetric) ++ SystemMetrics.garbageCollectors.flatMap{ gc => List(
      GaugeMetric(s"${gc.name}-gc-count-per-min" , "Used heap memory (MB)",
        () => gc.gcCount.toLong,
        StandardUnit.Count
      ),
      GaugeMetric(s"${gc.name}-gc-time-per-min", "Used heap memory (MB)",
        () => gc.gcTime.toLong,
        StandardUnit.Count
      )
    )}

  private def report() {
    val allMetrics: List[FrontendMetric] = this.systemMetrics ::: this.applicationMetrics
    if (!Play.isDev) {
      CloudWatch.putMetricsWithStage(allMetrics, applicationDimension)
    }
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)

    Jobs.schedule("ApplicationSystemMetricsJob", "0 * * * * ?"){
      report()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStop(app)
  }

}
