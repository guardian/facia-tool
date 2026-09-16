package model.packages

import model.editions.EditionsChefMetadata
import model.editions.EditionsFeastCollectionMetadata
import model.packages.PackageCardType
import model.packages.PackageCardType.Recipe
import play.api.libs.json._
import scalikejdbc.WrappedResultSet

import java.time.Instant

sealed trait PackageCard {
  val id: String
  val addedOn: Instant
  val cardType: PackageCardType
}

case class PackageRecipeCard(
    id: String,
    addedOn: Instant
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Recipe
}

case class PackageChefCard(
    id: String,
    metadata: Option[EditionsChefMetadata],
    addedOn: Instant
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Chef
}

case class PackageSubcollectionCard(
    id: String,
    metadata: Option[EditionsFeastCollectionMetadata],
    addedOn: Instant
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Subcollection
}

object PackageRecipeCard {
	implicit val format: OFormat[PackageRecipeCard] = Json.format[PackageRecipeCard]
}

object PackageChefCard {
	implicit val format: OFormat[PackageChefCard] = Json.format[PackageChefCard]
}

object PackageSubcollectionCard {
	implicit val format: OFormat[PackageSubcollectionCard] = Json.format[PackageSubcollectionCard]
}

object PackageCard {
  implicit val format: OFormat[PackageCard] = new OFormat[PackageCard] {
    override def reads(json: JsValue): JsResult[PackageCard] = {
      (json \ "cardType").validate[String].flatMap {
        case "recipe" => PackageRecipeCard.format.reads(json)
        case "chef" => PackageChefCard.format.reads(json)
        case "subcollection" => PackageSubcollectionCard.format.reads(json)
        case other => JsError(s"Unknown cardType: $other")
      }
    }

    override def writes(card: PackageCard): JsObject = card match {
      case c : PackageRecipeCard => PackageRecipeCard.format.writes(c) ++ Json.obj("cardType" -> "recipe")
      case c: PackageChefCard => PackageChefCard.format.writes(c) ++ Json.obj("cardType" -> "chef")
	  case c: PackageSubcollectionCard => PackageSubcollectionCard.format.writes(c) ++ Json.obj("cardType" -> "subcollection")
    }
  }

  def fromRowOpt(rs: WrappedResultSet): Option[PackageCard] = {
    for {
      id <- rs.stringOpt("id")
      cardTypeStr <- rs.stringOpt("card_type")
      cardType <- PackageCardType.fromString(cardTypeStr)
      addedOn <- rs.zonedDateTimeOpt("added_on").map(_.toInstant)
    } yield cardType match {
      case Recipe =>
        val recipeId = rs.string("page_code")
        PackageRecipeCard(
          id = recipeId,
          addedOn = addedOn
        )
      case PackageCardType.Chef =>
        val metadata = rs
          .stringOpt("feast_metadata")
          .map(Json.parse)
          .map(_.as[EditionsChefMetadata])
        val chefId = rs.string("page_code")
        PackageChefCard(
          id = chefId,
          metadata = metadata,
          addedOn = addedOn
        )
      case PackageCardType.Subcollection =>
        val metadata = rs
          .stringOpt("feast_metadata")
          .map(Json.parse)
          .map(_.as[EditionsFeastCollectionMetadata])
        PackageSubcollectionCard(
          id = id,
          metadata = metadata,
          addedOn = addedOn
        )
    }
  }
}
