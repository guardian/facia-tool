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
}
