package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json
import services.editions.db.FrontsQueries

class EditionsFrontMetadataTest extends FreeSpec with Matchers {

  private val name = "newName"
  val editionsFrontMetadata =
    EditionsFrontMetadata(Some(name), Some(Swatch.Opinion))

  "Editions Front Metadata Data to/from Json" - {
    val editionsFrontMetadataAsString =
      s"""{"nameOverride":"$name","swatch":"opinion"}"""

    "should serialise correctly" in {
      Json
        .toJson(editionsFrontMetadata)
        .toString() shouldBe editionsFrontMetadataAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[EditionsFrontMetadata](
          Json.parse(editionsFrontMetadataAsString)
        )
        .get shouldBe editionsFrontMetadata
    }

  }

  "Editions with name overrides are correctly published" - {

    val originalTitle = "original title"

    "Should use overridden name" in {
      val newTitle = "new title"
      val metadataWithOverride = EditionsFrontMetadata(Some(newTitle), None)
      val front = EditionsFront(
        "id",
        originalTitle,
        1,
        false,
        false,
        None,
        None,
        None,
        Some(metadataWithOverride),
        List()
      )
      front.toPublishedFront.name shouldBe newTitle
    }

    "Should use non-overridden name" in {
      val metadataWithoutOverride = EditionsFrontMetadata(None, None)
      val front = EditionsFront(
        "id",
        originalTitle,
        1,
        false,
        false,
        None,
        None,
        None,
        Some(metadataWithoutOverride),
        List()
      )
      front.toPublishedFront.name shouldBe originalTitle
    }

  }

}
