package services.editions

import model.editions.{EditionsCard, EditionsCollection, EditionsFront}
import scalikejdbc.WrappedResultSet

// Little helpers so we don't contaminate our business model with relational data
case class DbEditionsFront(front: EditionsFront, issueId: String, index: Int)
object DbEditionsFront {
  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String
  ): Option[DbEditionsFront] = {
    EditionsFront.fromRowOpt(rs, prefix).map { front =>
      DbEditionsFront(
        front,
        rs.string(prefix + "issue_id"),
        rs.int(prefix + "index")
      )
    }
  }
}

case class DbEditionsCollection(
    collection: EditionsCollection,
    frontId: String,
    index: Int
)
object DbEditionsCollection {
  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String
  ): Option[DbEditionsCollection] = {
    EditionsCollection.fromRowOpt(rs, prefix).map { collection =>
      DbEditionsCollection(
        collection,
        rs.string(prefix + "front_id"),
        rs.int(prefix + "index")
      )
    }
  }
}

case class DbEditionsCard(card: EditionsCard, collectionId: String, index: Int)
object DbEditionsCard {
  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String
  ): Option[DbEditionsCard] = {
    EditionsCard.fromRowOpt(rs, prefix).map { card =>
      DbEditionsCard(
        card,
        rs.string(prefix + "collection_id"),
        rs.int(prefix + "index")
      )
    }
  }
}
