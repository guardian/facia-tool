package services.editions

import scalikejdbc._
import conf.ApplicationConfiguration

class EditionsDB (config: ApplicationConfiguration) extends IssueQueries with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(config.postgres.url, config.postgres.user, config.postgres.password)
}

