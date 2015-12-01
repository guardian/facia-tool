package util

import play.api.libs.iteratee.Enumerator

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Enumerators {
  /** Sequentially enumerate the results of applying f to each element of as */
  def enumerate[A, B](as: Seq[A])(f: A => Future[B]) = Enumerator.unfoldM(as) {
    case first :: rest => f(first) map { b => Some(rest -> b) }
    case Nil => Future.successful(None)
  }
}
