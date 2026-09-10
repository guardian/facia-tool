package model.packages

import model.editions.{EditionsChefMetadata, EditionsFeastCollectionMetadata}
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

object PackageCard {
  implicit val format: OFormat[PackageCard] = new OFormat[PackageCard] {
    override def reads(json: JsValue): JsResult[PackageCard] = {
      (json \ "cardType").as[String] match {
        case "recipe" =>
          for {
            id <- (json \ "id").validate[String]
            addedOn <- (json \ "addedOn").validate[Long]
          } yield PackageRecipeCard(id, Instant.ofEpochMilli(addedOn))
        case "chef" =>
          for {
            id <- (json \ "id").validate[String]
            addedOn <- (json \ "addedOn").validate[Long]
            metadata <- (json \ "metadata").validateOpt[EditionsChefMetadata]
          } yield PackageChefCard(id, metadata, Instant.ofEpochMilli(addedOn))
        case "subcollection" =>
          for {
            id <- (json \ "id").validate[String]
            addedOn <- (json \ "addedOn").validate[Long]
            metadata <- (json \ "metadata").validateOpt[EditionsFeastCollectionMetadata]
          } yield PackageSubcollectionCard(id, metadata, Instant.ofEpochMilli(addedOn))
        case other => JsError(s"Unknown cardType: $other")
      }
    }

    override def writes(card: PackageCard): JsObject = card match {
      case PackageRecipeCard(id, addedOn) =>
        Json.obj(
          "id" -> id,
          "cardType" -> "recipe",
          "addedOn" -> addedOn.toEpochMilli
        )
      case PackageChefCard(id, metadata, addedOn) =>
        Json.obj(
          "id" -> id,
          "cardType" -> "chef",
          "metadata" -> metadata,
          "addedOn" -> addedOn.toEpochMilli
        )
      case PackageSubcollectionCard(id, metadata, addedOn) =>
        Json.obj(
          "id" -> id,
          "cardType" -> "subcollection",
          "metadata" -> metadata,
          "addedOn" -> addedOn.toEpochMilli
        )
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
