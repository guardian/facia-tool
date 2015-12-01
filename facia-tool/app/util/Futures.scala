package util

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

object Futures {
  implicit class RichFuture[A](future: Future[A]) {
    def mapTry = future.map(Success.apply) recover { case error => Failure(error) }
  }
}
