package fixtures

import com.whisk.docker._
import scala.concurrent.duration._

trait DockerPostgresService extends DockerKit {
  val externalPort = 44444
  val containerPort = 5432
  val dbUser = "user"
  val dbPassword = "safepassword"
  val databaseName = "mydb"
  val dbUrl = s"jdbc:postgresql://localhost:$externalPort/$databaseName?autoReconnect=true&useSSL=false"
  val driver = "org.postgresql.Driver"
  val dockerImage = "postgres:10.7-alpine"

  val postgresContainer = DockerContainer(dockerImage)
    .withPorts((containerPort, Some(externalPort)))
    .withEnv(s"POSTGRES_USER=$dbUser", s"POSTGRES_PASSWORD=$dbPassword", s"POSTGRES_DB=$databaseName")
    .withReadyChecker(
      new PostgresReadyChecker(dbUrl, dbUser, dbPassword, driver).looped(30, 1.second)
    )

  // adds our container to the DockerKit's list
  abstract override def dockerContainers: List[DockerContainer] =
    postgresContainer :: super.dockerContainers
}


