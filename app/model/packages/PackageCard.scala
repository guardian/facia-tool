package model.packages

import logging.Logging
import model.editions.{EditionsChefMetadata, EditionsFeastCollectionMetadata}
import model.packages.client.ClientPackageCard
import org.postgresql.util.PGobject
import play.api.libs.json.{JsError, JsNull, JsObject, JsResult, JsValue, Json, OFormat, Reads, Writes, __}
import scalikejdbc.WrappedResultSet

import java.time.{Instant, OffsetDateTime, ZoneId}

sealed trait PackageCard extends MetadataHelpers {
  val packageId: String
  val id: String
  val pageCode: String
  val index: Int
  val addedOn: OffsetDateTime
  val addedBy: String
  val addedEmail: String
  val cardType: PackageCardType

  def metadataJson: Option[JsValue]

  def metadataPG: Option[PGobject] = metadataJson.map(toPGobject)

  def toClientPackageCard: ClientPackageCard = ClientPackageCard(
    id = pageCode,
    cardType = cardType,
    addedOn = addedOn.toInstant.toEpochMilli,
    metadata = metadataJson
  )
}

case class PackageRecipeCard(
    id: String,
    addedOn: OffsetDateTime,
    metadata: Option[JsValue] = None,
    packageId: String = "",
    pageCode: String = "",
    index: Int = 0,
    addedBy: String = "",
    addedEmail: String = ""
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Recipe
  override def metadataJson: Option[JsValue] = metadata
}

case class PackageChefCard(
    id: String,
    metadata: Option[EditionsChefMetadata],
    addedOn: OffsetDateTime,
    packageId: String = "",
    pageCode: String = "",
    index: Int = 0,
    addedBy: String = "",
    addedEmail: String = ""
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Chef
  override def metadataJson: Option[JsValue] = metadata.map(Json.toJson(_))
}

case class PackageSubcollectionCard(
    id: String,
    metadata: Option[EditionsFeastCollectionMetadata],
    addedOn: OffsetDateTime,
    packageId: String = "",
    pageCode: String = "",
    index: Int = 0,
    addedBy: String = "",
    addedEmail: String = ""
) extends PackageCard {
  override val cardType: PackageCardType = PackageCardType.Subcollection
  override def metadataJson: Option[JsValue] = metadata.map(Json.toJson(_))
}

object PackageRecipeCard {
  implicit val format: OFormat[PackageRecipeCard] = new OFormat[PackageRecipeCard] {
    override def reads(json: JsValue): JsResult[PackageRecipeCard] = {
      for {
        id <- (json \ "id").validate[String]
        addedOn <- (json \ "addedOn").validate[OffsetDateTime]
      } yield {
        val metadata = (json \ "metadata").asOpt[JsValue].filterNot(_ == JsNull)
        val packageId = (json \ "packageId").asOpt[String].getOrElse("")
        val pageCode = (json \ "pageCode").asOpt[String].getOrElse("")
        val index = (json \ "index").asOpt[Int].getOrElse(0)
        val addedBy = (json \ "addedBy").asOpt[String].getOrElse("")
        val addedEmail = (json \ "addedEmail").asOpt[String].getOrElse("")

        PackageRecipeCard(
          id = id,
          addedOn = addedOn,
          metadata = metadata,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      }
    }

    override def writes(card: PackageRecipeCard): JsObject = {
      Json.obj(
        "id" -> card.id,
        "addedOn" -> card.addedOn,
        "metadata" -> card.metadata,
        "packageId" -> card.packageId,
        "pageCode" -> card.pageCode,
        "index" -> card.index,
        "addedBy" -> card.addedBy,
        "addedEmail" -> card.addedEmail
      )
    }
  }
}

object PackageChefCard {
  implicit val format: OFormat[PackageChefCard] = new OFormat[PackageChefCard] {
    override def reads(json: JsValue): JsResult[PackageChefCard] = {
      for {
        id <- (json \ "id").validate[String]
        addedOn <- (json \ "addedOn").validate[OffsetDateTime]
      } yield {
        val metadata = (json \ "metadata").asOpt[EditionsChefMetadata]
        val packageId = (json \ "packageId").asOpt[String].getOrElse("")
        val pageCode = (json \ "pageCode").asOpt[String].getOrElse("")
        val index = (json \ "index").asOpt[Int].getOrElse(0)
        val addedBy = (json \ "addedBy").asOpt[String].getOrElse("")
        val addedEmail = (json \ "addedEmail").asOpt[String].getOrElse("")

        PackageChefCard(
          id = id,
          metadata = metadata,
          addedOn = addedOn,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      }
    }

    override def writes(card: PackageChefCard): JsObject = {
      Json.obj(
        "id" -> card.id,
        "metadata" -> card.metadata,
        "addedOn" -> card.addedOn,
        "packageId" -> card.packageId,
        "pageCode" -> card.pageCode,
        "index" -> card.index,
        "addedBy" -> card.addedBy,
        "addedEmail" -> card.addedEmail
      )
    }
  }
}

object PackageSubcollectionCard {
  implicit val format: OFormat[PackageSubcollectionCard] = new OFormat[PackageSubcollectionCard] {
    override def reads(json: JsValue): JsResult[PackageSubcollectionCard] = {
      for {
        id <- (json \ "id").validate[String]
        addedOn <- (json \ "addedOn").validate[OffsetDateTime]
      } yield {
        val metadata = (json \ "metadata").asOpt[EditionsFeastCollectionMetadata]
        val packageId = (json \ "packageId").asOpt[String].getOrElse("")
        val pageCode = (json \ "pageCode").asOpt[String].getOrElse("")
        val index = (json \ "index").asOpt[Int].getOrElse(0)
        val addedBy = (json \ "addedBy").asOpt[String].getOrElse("")
        val addedEmail = (json \ "addedEmail").asOpt[String].getOrElse("")

        PackageSubcollectionCard(
          id = id,
          metadata = metadata,
          addedOn = addedOn,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      }
    }

    override def writes(card: PackageSubcollectionCard): JsObject = {
      Json.obj(
        "id" -> card.id,
        "metadata" -> card.metadata,
        "addedOn" -> card.addedOn,
        "packageId" -> card.packageId,
        "pageCode" -> card.pageCode,
        "index" -> card.index,
        "addedBy" -> card.addedBy,
        "addedEmail" -> card.addedEmail
      )
    }
  }
}

object PackageCard extends Logging with MetadataHelpers {
  implicit val format: OFormat[PackageCard] = new OFormat[PackageCard] {
    override def reads(json: JsValue): JsResult[PackageCard] = {
      (json \ "cardType").validate[String].flatMap {
        case "recipe"        => Json.fromJson[PackageRecipeCard](json)
        case "chef"          => Json.fromJson[PackageChefCard](json)
        case "subcollection" => Json.fromJson[PackageSubcollectionCard](json)
        case other           => JsError(s"Unknown cardType: $other")
      }
    }

    override def writes(card: PackageCard): JsObject = {
      val base = card match {
        case c: PackageRecipeCard =>
          Json.toJson(c)(PackageRecipeCard.format).as[JsObject]
        case c: PackageChefCard =>
          Json.toJson(c)(PackageChefCard.format).as[JsObject]
        case c: PackageSubcollectionCard =>
          Json.toJson(c)(PackageSubcollectionCard.format).as[JsObject]
      }
      base ++ Json.obj("cardType" -> card.cardType.toString)
    }
  }

  def fromClientPackageCard(client: ClientPackageCard): PackageCard = {
    val addedOn = OffsetDateTime.ofInstant(
      Instant.ofEpochMilli(client.addedOn),
      ZoneId.systemDefault()
    )

    client.cardType match {
      case PackageCardType.Recipe =>
        PackageRecipeCard(
          id = client.id,
          addedOn = addedOn,
          metadata = client.metadata,
          packageId = "",
          pageCode = client.id,
          index = 0,
          addedBy = "",
          addedEmail = ""
        )
      case PackageCardType.Chef =>
        PackageChefCard(
          id = client.id,
          metadata = client.metadata.flatMap(Json.fromJson[EditionsChefMetadata](_).asOpt),
          addedOn = addedOn,
          packageId = "",
          pageCode = client.id,
          index = 0,
          addedBy = "",
          addedEmail = ""
        )
      case PackageCardType.Subcollection =>
        PackageSubcollectionCard(
          id = client.id,
          metadata = client.metadata.flatMap(
            Json.fromJson[EditionsFeastCollectionMetadata](_).asOpt
          ),
          addedOn = addedOn,
          packageId = "",
          pageCode = client.id,
          index = 0,
          addedBy = "",
          addedEmail = ""
        )
      case PackageCardType.Invalid =>
        throw new IllegalArgumentException(
          s"Cannot convert invalid package card type: ${client.cardType}"
        )
    }
  }

  def apply(
      packageId: String,
      cardType: PackageCardType,
      pageCode: String,
      index: Int,
      metadata: Option[JsValue],
      addedOn: OffsetDateTime,
      addedBy: String,
      addedEmail: String
  ): PackageCard = {
    cardType match {
      case PackageCardType.Recipe =>
        PackageRecipeCard(
          id = pageCode,
          addedOn = addedOn,
          metadata = metadata,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      case PackageCardType.Chef =>
        PackageChefCard(
          id = pageCode,
          metadata = metadata.flatMap(Json.fromJson[EditionsChefMetadata](_).asOpt),
          addedOn = addedOn,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      case PackageCardType.Subcollection =>
        PackageSubcollectionCard(
          id = pageCode,
          metadata = metadata.flatMap(
            Json.fromJson[EditionsFeastCollectionMetadata](_).asOpt
          ),
          addedOn = addedOn,
          packageId = packageId,
          pageCode = pageCode,
          index = index,
          addedBy = addedBy,
          addedEmail = addedEmail
        )
      case PackageCardType.Invalid =>
        throw new IllegalArgumentException(s"Invalid card type: $cardType")
    }
  }

  def fromRow(rs: WrappedResultSet): Option[PackageCard] =
    for {
      cardType <- PackageCardType.fromString(rs.string("card_type"))
    } yield {
      cardType match {
        case PackageCardType.Recipe =>
          PackageRecipeCard(
            id = rs.string("page_code"),
            addedOn = rs.offsetDateTime("added_on"),
            metadata = rs.stringOpt("metadata").map(Json.parse),
            packageId = rs.string("package_id"),
            pageCode = rs.string("page_code"),
            index = rs.int("index"),
            addedBy = rs.string("added_by"),
            addedEmail = rs.string("added_email")
          )
        case PackageCardType.Chef =>
          PackageChefCard(
            id = rs.string("page_code"),
            metadata = rs.stringOpt("metadata").map(Json.parse).flatMap(
              Json.fromJson[EditionsChefMetadata](_).asOpt
            ),
            addedOn = rs.offsetDateTime("added_on"),
            packageId = rs.string("package_id"),
            pageCode = rs.string("page_code"),
            index = rs.int("index"),
            addedBy = rs.string("added_by"),
            addedEmail = rs.string("added_email")
          )
        case PackageCardType.Subcollection =>
          PackageSubcollectionCard(
            id = rs.string("page_code"),
            metadata = rs.stringOpt("metadata").map(Json.parse).flatMap(
              Json.fromJson[EditionsFeastCollectionMetadata](_).asOpt
            ),
            addedOn = rs.offsetDateTime("added_on"),
            packageId = rs.string("package_id"),
            pageCode = rs.string("page_code"),
            index = rs.int("index"),
            addedBy = rs.string("added_by"),
            addedEmail = rs.string("added_email")
          )
        case PackageCardType.Invalid =>
          throw new IllegalArgumentException("Invalid package card type")
      }
    }
}
