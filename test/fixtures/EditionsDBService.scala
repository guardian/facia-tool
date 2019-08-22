package fixtures

import com.whisk.docker.impl.dockerjava.DockerKitDockerJava
import com.whisk.docker.scalatest.DockerTestKit
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, Suite}
import play.api.db.{Database, Databases}
import play.api.db.evolutions.Evolutions
import services.editions.db.EditionsDB

trait EditionsDBService extends DockerTestKit with DockerKitDockerJava with DockerPostgresService
  with BeforeAndAfterAll  { self: Suite =>

  var editionsDB: EditionsDB = _
  var database: Database = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    database = Databases(driver, dbUrl, config = Map(
      "username" -> dbUser,
      "password" -> dbPassword
    ))

    editionsDB = new EditionsDB(dbUrl, dbUser, dbPassword)
  }
}
