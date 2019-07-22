package services.editions.db

import scalikejdbc._

class EditionsDB(url: String, user: String, password: String) extends IssueQueries with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(url, user, password)
}

