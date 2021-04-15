package metrics

import java.util.concurrent.atomic.AtomicLong

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.StandardUnit
import org.joda.time.DateTime

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

sealed trait DataPoint {
  val value: Long
  val time: Option[DateTime]
}

case class DurationDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class CountDataPoint(value: Long) extends DataPoint {
  val time: Option[DateTime] = None
}

case class GaugeDataPoint(value: Long) extends DataPoint {
  val time: Option[DateTime] = None
}

case class FrontendStatisticSet(metric: FrontendMetric, datapoints: List[DataPoint]) {
  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0L).toDouble
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0L).toDouble
  lazy val sum: Double = datapoints.map(_.value).sum.toDouble
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)

  def reset(): Unit = metric.putDataPoints(datapoints)
}

sealed trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getAndResetDataPoints: List[DataPoint]
  def putDataPoints(points: List[DataPoint]): Unit
  def isEmpty: Boolean
}

case class GaugeMetric(name: String, description: String, get: () => Long, metricUnit: StandardUnit = StandardUnit.Megabytes) extends FrontendMetric {
  def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  def putDataPoints(points: List[DataPoint]): Unit = ()
  def isEmpty: Boolean = false
}

case class CountMetric(name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  val metricUnit = StandardUnit.Count

  def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L)))
  def getAndReset: Long = getAndResetDataPoints.map(_.value).reduce(_ + _)
  def putDataPoints(points: List[DataPoint]): Unit = for(dataPoint <- points) count.addAndGet(dataPoint.value)

  def getResettingValue(): Long = count.get()

  def record(): Unit = count.incrementAndGet()
  def increment(): Unit = record()
  def isEmpty: Boolean = count.get() == 0L
}

case class DurationMetric(name: String, metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DataPoint]] = Agent(List[DurationDataPoint]())

  def getDataPoints: List[DataPoint] = dataPoints.get()

  def getDataFuture: Future[List[DataPoint]] = dataPoints.future()

  def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  def putDataPoints(points: List[DataPoint]): Unit = dataPoints.alter(points ::: _)

  def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Long): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))
  def isEmpty: Boolean = dataPoints.get().isEmpty
}
