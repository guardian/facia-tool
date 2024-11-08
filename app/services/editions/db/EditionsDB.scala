package services.editions.db

import java.time.{Instant, OffsetDateTime, ZoneOffset}
import java.time.temporal.ChronoUnit
import scalikejdbc._
import com.gu.pandomainauth.model.User
import model.editions.{
  EditionsCard,
  EditionsFeastCollection,
  EditionsFeastCollectionMetadata,
  EditionsFront
}

import java.util.UUID

class EditionsDB(url: String, user: String, password: String)
    extends IssueQueries
    with FrontsQueries
    with CollectionsQueries {
  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(url, user, password)

  /** Add a EditionsCollection to an EditionsFront at the specified index.
    *
    * @return
    *   tuple of the updated front and the ID of the collection.
    */
  def addCollectionToFront(
      frontId: String,
      name: Option[String] = None,
      collectionIndex: Option[Int] = None,
      user: User,
      now: OffsetDateTime
  ): Either[Error, (EditionsFront, String)] = DB localTx { implicit session =>
    val truncatedNow = EditionsDB.truncateDateTime(now)

    for {
      currentFront <- getFront(frontId).toRight(
        EditionsDB.NotFoundError(s"Front $frontId not found")
      )
      collectionId <- insertCollection(
        frontId = currentFront.id,
        collectionIndex = collectionIndex.getOrElse(0),
        name = name.getOrElse("New collection"),
        user = user,
        now = truncatedNow
      )
      updatedFront <- getFront(frontId).toRight(
        EditionsDB.InvariantError(s"Updated front $frontId not found in issue")
      )
      _ <- updatedFront.collections
        .find(_.id == collectionId)
        .toRight(
          EditionsDB.InvariantError(
            s"New collection ${collectionId} not found in updated front ${frontId}"
          )
        )
    } yield (updatedFront, collectionId)
  }

  /** Remove an EditionsCollection from an EditionsFront.
    */
  def removeCollectionFromFront(
      frontId: String,
      collectionId: String,
      user: User,
      now: OffsetDateTime
  ): Either[Error, EditionsFront] = DB localTx { implicit session =>
    val truncatedNow = EditionsDB.truncateDateTime(now)

    for {
      _ <- getFront(frontId).toRight(
        EditionsDB.NotFoundError(s"Front ${frontId} not found")
      )
      _ <- deleteCollection(
        collectionId,
        user = user,
        now = truncatedNow
      )
      updatedFront <- reindexCollectionsForFront(frontId)
    } yield updatedFront
  }

  def moveCollection(
      frontId: String,
      collectionId: String,
      newIndex: Int
  ): Either[Error, EditionsFront] = DB localTx { implicit session =>
    for {
      _ <- getFront(frontId).toRight(
        EditionsDB.NotFoundError(s"Front $frontId not found")
      )
      _ <- moveCollectionToIndex(collectionId, newIndex)
      updatedFront <- getFront(frontId).toRight(
        EditionsDB.InvariantError(
          s"Front $frontId not found after collection index was updated"
        )
      )
    } yield updatedFront
  }

  private def reindexCollectionsForFront(
      frontId: String
  )(implicit session: DBSession): Either[Error, EditionsFront] =
    for {
      front <- getFront(frontId).toRight(
        EditionsDB.InvariantError("Could not find front to reindex")
      )
      _ <- updateCollectionIndices(front.collections.map(_.id))
      updatedFront <- getFront(frontId).toRight(
        EditionsDB.InvariantError(
          "Could not find front with reindexed collections"
        )
      )
    } yield updatedFront
}

object EditionsDB {
  def dateTimeFromMillis(millis: Long): OffsetDateTime =
    Instant.ofEpochMilli(millis).atOffset(ZoneOffset.UTC)
  def truncateDateTime(odt: OffsetDateTime): OffsetDateTime =
    odt.truncatedTo(ChronoUnit.MILLIS)
  def getUserName(user: User) = user.firstName + " " + user.lastName

  // An entity the user expected to be there was not found
  case class NotFoundError(message: String) extends Error(message)

  // The input data is incorrect
  case class InvalidInput(message: String) extends Error(message)

  // There was a problem writing data to the DB
  case class WriteError(message: String) extends Error(message)

  // There was an issue with the data stored in the DB
  case class InvariantError(message: String) extends Error(message)
}
