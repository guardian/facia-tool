package fixtures

import java.sql.DriverManager

import com.whisk.docker.{DockerCommandExecutor, DockerContainerState, DockerReadyChecker}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class PostgresReadyChecker(url: String,
                           user: String,
                           password: String,
                           driver: String) extends DockerReadyChecker {
  override def apply(container: DockerContainerState
                    )(implicit docker: DockerCommandExecutor, ec: ExecutionContext): Future[Boolean] =
    container.getPorts().map( ports =>
      Try {
        Class.forName(driver)
        Option(DriverManager.getConnection(url, user, password))
          .map(_.close)
          .isDefined
      }.getOrElse(false)
    )
}
