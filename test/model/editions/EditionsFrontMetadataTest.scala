package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json
import services.editions.db.FrontsQueries

class EditionsFrontMetadataTest extends FreeSpec with Matchers {

  private val name = "newName"
  val editionsFrontMetadata = EditionsFrontMetadata(Some(name), Some(Swatch.Opinion))

  "Editions Front Metadata Data to/from Json" - {
    val editionsFrontMetadataAsString = s"""{"nameOverride":"$name","swatch":"opinion"}"""

    "should serialise correctly" in {
      Json.toJson(editionsFrontMetadata).toString() shouldBe editionsFrontMetadataAsString
    }

    "should deserialise correctly" in {
      Json.fromJson[EditionsFrontMetadata](Json.parse(editionsFrontMetadataAsString)).get shouldBe editionsFrontMetadata
    }

  }


  "Editions Front Metadata Data merging" - {
    val editionsFrontMetadataSwatchOnly = EditionsFrontMetadata(None, Some(Swatch.Opinion))
    val editionsFrontMetadataNewnameOnly = EditionsFrontMetadata(Some(name), None)

    "should merge Name Overrides correctly" in {
      object DumbObject extends FrontsQueries
      DumbObject.mergeMetadatas(editionsFrontMetadataSwatchOnly, editionsFrontMetadataNewnameOnly) shouldBe editionsFrontMetadata
    }

    "should merge Swatches correctly" in {
      object DumbObject extends FrontsQueries
      DumbObject.mergeMetadatas(editionsFrontMetadataNewnameOnly, editionsFrontMetadataSwatchOnly) shouldBe editionsFrontMetadata
    }

  }

  "Editions with name overrides are correctly published" - {

    val originalTitle = "original title"

    "Should use overridden name" in {
      val newTitle = "new title"
      val metadataWithOverride = EditionsFrontMetadata(Some(newTitle), None)
      val front = EditionsFront("id", originalTitle, 1, false, false, None, None, None, Some(metadataWithOverride), List())
      front.toPublishedFront.get.name shouldBe newTitle
    }

    "Should use non-overridden name" in {
      val metadataWithoutOverride = EditionsFrontMetadata(None, None)
      val front = EditionsFront("id", originalTitle, 1, false, false, None, None, None, Some(metadataWithoutOverride), List())
      front.toPublishedFront.get.name shouldBe originalTitle
    }

  }

}
