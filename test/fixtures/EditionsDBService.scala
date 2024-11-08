package fixtures

import org.scalatest.{BeforeAndAfterAll, Suite}
import play.api.db.{Database, Databases}
import services.editions.db.EditionsDB

trait EditionsDBService extends BeforeAndAfterAll { self: Suite =>

  private val port = 4724
  private val dbUser = "faciatool"
  private val dbPassword = "faciatool"
  private val databaseName = "faciatool"
  private val dbUrl =
    s"jdbc:postgresql://localhost:$port/$databaseName?autoReconnect=true&useSSL=false"
  private val driver = "org.postgresql.Driver"

  var editionsDB: EditionsDB = _
  var database: Database = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    database = Databases(
      driver,
      dbUrl,
      config = Map(
        "username" -> dbUser,
        "password" -> dbPassword
      )
    )

    editionsDB = new EditionsDB(dbUrl, dbUser, dbPassword)
  }
}
