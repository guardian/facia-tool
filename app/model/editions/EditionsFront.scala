package model.editions

import org.postgresql.util.PGobject
import play.api.libs.json.{Json, OFormat, OWrites}
import scalikejdbc.WrappedResultSet

object EditionsFrontMetadata {
  implicit val format: OFormat[EditionsFrontMetadata] =
    Json.format[EditionsFrontMetadata]
}

case class EditionsFrontMetadata(
    nameOverride: Option[String],
    swatch: Option[Swatch]
) {
  def toPGobject: PGobject = {
    val pgo = new PGobject()
    pgo.setType("jsonb")
    pgo.setValue(Json.toJson(this).toString())
    pgo
  }
}

case class EditionsFront(
    id: String,
    displayName: String,
    index: Int,
    isSpecial: Boolean,
    isHidden: Boolean,
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    metadata: Option[EditionsFrontMetadata],
    collections: List[EditionsCollection]
) {
  def toPublishedFront: PublishedFront = {
    val name = getName
    val swatch = metadata
      .collect { case EditionsFrontMetadata(_, Some(swatch)) => swatch }
      .getOrElse(Swatch.Neutral)
    PublishedFront(
      id,
      name,
      collections
        .filterNot(_.isHidden) // drop hidden collections
        .map(_.toPublishedCollection) // convert
        .filterNot(_.items.isEmpty), // drop collections that contain no items
      swatch
    )
  }

  def toSkeleton: EditionsFrontSkeleton = EditionsFrontSkeleton(
    name = displayName,
    collections = collections.map(_.toSkeleton),
    presentation = metadata
      .flatMap(_.swatch)
      .map(FrontPresentation.apply)
      .getOrElse(FrontPresentation(Swatch.Neutral)),
    hidden = isHidden,
    isSpecial = isSpecial
  )

  def getName = metadata
    .collect { case EditionsFrontMetadata(Some(overrideName), _) =>
      overrideName
    }
    .getOrElse(displayName)
}

object EditionsFront {
  implicit val writes: OWrites[EditionsFront] = Json.writes[EditionsFront]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsFront = {
    EditionsFront(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.int(prefix + "index"),
      rs.boolean(prefix + "is_special"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      rs.stringOpt(prefix + "metadata")
        .map(s => Json.parse(s).validate[EditionsFrontMetadata].get),
      Nil
    )
  }

  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String = ""
  ): Option[EditionsFront] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      name <- rs.stringOpt(prefix + "name")
      index <- rs.intOpt(prefix + "index")
      isSpecial <- rs.booleanOpt(prefix + "is_special")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield EditionsFront(
      id,
      name,
      index,
      isSpecial,
      isHidden,
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      rs.stringOpt(prefix + "metadata")
        .map(s => Json.parse(s).validate[EditionsFrontMetadata].get),
      Nil
    )
  }
}
