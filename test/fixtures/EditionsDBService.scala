package fixtures

import com.whisk.docker.impl.dockerjava.DockerKitDockerJava
import com.whisk.docker.scalatest.DockerTestKit
import org.scalatest.{BeforeAndAfterAll, Suite}
import play.api.db.Databases
import play.api.db.evolutions.Evolutions
import services.editions.db.EditionsDB

trait EditionsDBService extends DockerTestKit with DockerKitDockerJava with DockerPostgresService
  with BeforeAndAfterAll { self: Suite =>

  var editionsDB: EditionsDB = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    val database = Databases(driver, dbUrl, config = Map(
      "username" -> user,
      "password" -> password
    ))
    Evolutions.applyEvolutions(database)

    editionsDB = new EditionsDB(dbUrl, user, password)
  }
}
