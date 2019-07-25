package services.editions.db

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

import scalikejdbc._

class EditionsDB(url: String, user: String, password: String) extends IssueQueries with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(url, user, password)
}

object EditionsDB {
  def truncateDateTime(odt: OffsetDateTime): OffsetDateTime = odt.truncatedTo(ChronoUnit.MILLIS)
}
