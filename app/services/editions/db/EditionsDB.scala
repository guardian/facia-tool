package services.editions.db

import java.time.{Instant, OffsetDateTime, ZoneOffset}
import java.time.temporal.ChronoUnit

import scalikejdbc._
import com.gu.pandomainauth.model.User
import services.editions.DbEditionsFront
import model.editions.EditionsFront
import scala.util.Try

class EditionsDB(url: String, user: String, password: String) extends IssueQueries with FrontsQueries with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(url, user, password)


  /**
    * Add a EditionsCollection to an EditionsFront at the specified index.
    *
    * @return the ID of the collection.
    */
  def addCollectionToFront(frontId: String, name: Option[String] = None, collectionIndex: Option[Int] = None, user: User, now: OffsetDateTime): Either[Error, EditionsFront] = DB localTx { implicit session =>
    val truncatedNow = EditionsDB.truncateDateTime(now)

    for {
      currentFront <- getFront(frontId).toRight(EditionsDB.NotFoundError(s"Front ${frontId} not found"))
      collectionId <- insertCollection(
        frontId = currentFront.id,
        collectionIndex = collectionIndex.getOrElse(currentFront.collections.size),
        name = name.getOrElse("New collection"),
        user = user,
        now = truncatedNow
      )
      updatedFront <- getFront(frontId).toRight(EditionsDB.InvariantError(s"Updated front ${frontId} not found in issue"))
      newCollection <- updatedFront.collections.find(_.id == collectionId).toRight(EditionsDB.InvariantError(s"New collection ${collectionId} not found in updated front ${frontId}"))
    } yield updatedFront
  }
}

object EditionsDB {
  def dateTimeFromMillis(millis: Long): OffsetDateTime = Instant.ofEpochMilli(millis).atOffset(ZoneOffset.UTC)
  def truncateDateTime(odt: OffsetDateTime): OffsetDateTime = odt.truncatedTo(ChronoUnit.MILLIS)
  def getUserName(user: User) = user.firstName + " " + user.lastName

  // An entity the user expected to be there was not found
  case class NotFoundError(message: String) extends Error(message)

  // There was a problem writing data to the DB
  case class WriteError(message: String) extends Error(message)

  // There was an issue with the data stored in the DB
  case class InvariantError(message: String) extends Error(message)
}
