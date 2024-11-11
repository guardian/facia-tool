package metrics

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import org.apache.pekko.actor.Scheduler
import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit}
import logging.Logging

import scala.jdk.CollectionConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

object SystemMetrics {

  class GcRateMetric(bean: GarbageCollectorMXBean) {
    private val lastGcCount = new AtomicLong(0)
    private val lastGcTime = new AtomicLong(0)

    lazy val name = bean.getName.replace(" ", "_")

    def gcCount: Double = {
      val totalGcCount = bean.getCollectionCount
      (totalGcCount - lastGcCount.getAndSet(totalGcCount)).toDouble
    }

    def gcTime: Double = {
      val totalGcTime = bean.getCollectionTime
      (totalGcTime - lastGcTime.getAndSet(totalGcTime)).toDouble
    }
  }

  lazy val garbageCollectors: Seq[GcRateMetric] =
    ManagementFactory.getGarbageCollectorMXBeans.asScala
      .map(new GcRateMetric(_))
      .toSeq

  // divide by 1048576 to convert bytes to MB

  object MaxHeapMemoryMetric
      extends GaugeMetric(
        "max-heap-memory",
        "Max heap memory (MB)",
        () =>
          ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax / 1048576
      )

  object UsedHeapMemoryMetric
      extends GaugeMetric(
        "used-heap-memory",
        "Used heap memory (MB)",
        () =>
          ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed / 1048576
      )

  object MaxNonHeapMemoryMetric
      extends GaugeMetric(
        "max-non-heap-memory",
        "Max non heap memory (MB)",
        () =>
          ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax / 1048576
      )

  object UsedNonHeapMemoryMetric
      extends GaugeMetric(
        "used-non-heap-memory",
        "Used non heap memory (MB)",
        () =>
          ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed / 1048576
      )

  object AvailableProcessorsMetric
      extends GaugeMetric(
        "available-processors",
        "Available processors",
        () => ManagementFactory.getOperatingSystemMXBean.getAvailableProcessors
      )

  object FreeDiskSpaceMetric
      extends GaugeMetric(
        "free-disk-space",
        "Free disk space (MB)",
        () => new File("/").getUsableSpace / 1048576
      )

  object TotalDiskSpaceMetric
      extends GaugeMetric(
        "total-disk-space",
        "Total disk space (MB)",
        () => new File("/").getTotalSpace / 1048576
      )

  // yeah, casting to com.sun.. ain't too pretty
  object TotalPhysicalMemoryMetric
      extends GaugeMetric(
        "total-physical-memory",
        "Total physical memory",
        () =>
          ManagementFactory.getOperatingSystemMXBean match {
            case b: com.sun.management.OperatingSystemMXBean =>
              b.getTotalPhysicalMemorySize
            case _ => -1
          }
      )

  object FreePhysicalMemoryMetric
      extends GaugeMetric(
        "free-physical-memory",
        "Free physical memory",
        () =>
          ManagementFactory.getOperatingSystemMXBean match {
            case b: com.sun.management.OperatingSystemMXBean =>
              b.getFreePhysicalMemorySize
            case _ => -1
          }
      )

  object OpenFileDescriptorsMetric
      extends GaugeMetric(
        "open-file-descriptors",
        "Open file descriptors",
        () =>
          ManagementFactory.getOperatingSystemMXBean match {
            case b: com.sun.management.UnixOperatingSystemMXBean =>
              b.getOpenFileDescriptorCount
            case _ => -1
          }
      )

  object MaxFileDescriptorsMetric
      extends GaugeMetric(
        "max-file-descriptors",
        "Max file descriptors",
        () =>
          ManagementFactory.getOperatingSystemMXBean match {
            case b: com.sun.management.UnixOperatingSystemMXBean =>
              b.getMaxFileDescriptorCount
            case _ => -1
          }
      )
}

object S3Metrics {
  object S3ClientExceptionsMetric
      extends CountMetric(
        "s3-client-exceptions",
        "Number of times the AWS S3 client has thrown an Exception"
      )
}

object FaciaToolMetrics {
  object ApiUsageCount
      extends CountMetric(
        "api-usage",
        "Number of requests to the Facia API from clients (The tool)"
      )

  object ProxyCount
      extends CountMetric(
        "api-proxy-usage",
        "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
      )

  object DraftPublishCount
      extends CountMetric(
        "draft-publish",
        "Number of drafts that have been published"
      )

  object EnqueuePressSuccess
      extends CountMetric(
        "faciatool-enqueue-press-success",
        "Number of successful enqueuing of press commands"
      )

  object EnqueuePressFailure
      extends CountMetric(
        "faciatool-enqueue-press-failure",
        "Number of failed enqueuing of press commands"
      )
}

class CloudWatchApplicationMetrics(
    appName: String,
    stage: String,
    cloudWatch: CloudWatch,
    val scheduler: Scheduler,
    val isDev: Boolean
) extends Logging {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension =
    new Dimension().withName("ApplicationName").withValue(appName)
  def applicationMetrics: List[FrontendMetric] = List(
    FaciaToolMetrics.ApiUsageCount,
    FaciaToolMetrics.ProxyCount,
    FaciaToolMetrics.DraftPublishCount,
    FaciaToolMetrics.EnqueuePressSuccess,
    FaciaToolMetrics.EnqueuePressFailure,
    S3Metrics.S3ClientExceptionsMetric
  )

  def systemMetrics: List[FrontendMetric] = List(
    SystemMetrics.MaxHeapMemoryMetric,
    SystemMetrics.UsedHeapMemoryMetric,
    SystemMetrics.TotalPhysicalMemoryMetric,
    SystemMetrics.FreePhysicalMemoryMetric,
    SystemMetrics.AvailableProcessorsMetric,
    SystemMetrics.FreeDiskSpaceMetric,
    SystemMetrics.TotalDiskSpaceMetric,
    SystemMetrics.MaxFileDescriptorsMetric,
    SystemMetrics.OpenFileDescriptorsMetric
  ) ++ SystemMetrics.garbageCollectors.flatMap { gc =>
    List(
      GaugeMetric(
        s"${gc.name}-gc-count-per-min",
        "Used heap memory (MB)",
        () => gc.gcCount.toLong,
        StandardUnit.Count
      ),
      GaugeMetric(
        s"${gc.name}-gc-time-per-min",
        "Used heap memory (MB)",
        () => gc.gcTime.toLong,
        StandardUnit.Count
      )
    )
  }

  private def report(): Unit = {
    val allMetrics: List[FrontendMetric] =
      this.systemMetrics ::: this.applicationMetrics
    if (!isDev) {
      val stageDimension = new Dimension().withName("Stage").withValue(stage)
      cloudWatch.putMetricsWithStage(
        allMetrics,
        applicationDimension,
        stageDimension
      )
    }
  }

  logger.info("Starting cloudwatch metrics")
  scheduler.scheduleWithFixedDelay(initialDelay = 1.seconds, delay = 1.minute) {
    () => report()
  }
}
