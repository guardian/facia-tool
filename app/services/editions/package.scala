package services.editions

import model.editions.{EditionsArticle, EditionsCollection, EditionsFront}
import scalikejdbc.WrappedResultSet

// Little helpers so we don't contaminate our business model with relational data
case class DbEditionsFront(front: EditionsFront, issueId: String, index: Int)
object DbEditionsFront {
  def fromRowOpt(rs: WrappedResultSet, prefix: String): Option[DbEditionsFront] = {
    EditionsFront.fromRowOpt(rs, prefix).map { front =>
      DbEditionsFront(front, rs.string(prefix + "issue_id"), rs.int(prefix + "index"))
    }
  }
}

case class DbEditionsCollection(collection: EditionsCollection, frontId: String, index: Int)
object DbEditionsCollection {
  def fromRowOpt(rs: WrappedResultSet, prefix: String): Option[DbEditionsCollection] = {
    EditionsCollection.fromRowOpt(rs, prefix).map { collection =>
      DbEditionsCollection(collection, rs.string(prefix + "front_id"), rs.int(prefix + "index"))
    }
  }
}

case class DbEditionsArticle(article: EditionsArticle, collectionId: String, index: Int)
object DbEditionsArticle {
  def fromRowOpt(rs: WrappedResultSet, prefix: String): Option[DbEditionsArticle] = {
    EditionsArticle.fromRowOpt(rs, prefix).map { article =>
      DbEditionsArticle(
        article,
        rs.string(prefix + "collection_id"),
        rs.int(prefix + "index"))
    }
  }
}
