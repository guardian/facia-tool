package services.editions.db

import java.time.{Instant, OffsetDateTime, ZoneOffset}
import java.time.temporal.ChronoUnit

import scalikejdbc._

class EditionsDB(url: String, user: String, password: String) extends IssueQueries with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(url, user, password)
}

object EditionsDB {
  def dateTimeFromMillis(millis: Long): OffsetDateTime = Instant.ofEpochMilli(millis).atOffset(ZoneOffset.UTC)
  def truncateDateTime(odt: OffsetDateTime): OffsetDateTime = odt.truncatedTo(ChronoUnit.MILLIS)
}
