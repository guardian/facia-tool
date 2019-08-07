package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json

class SwatchTest extends FreeSpec with Matchers {

  val cultureEnumAsString = "\"culture\""
  val culture = Swatch.Culture

  "Swatch Data" - {

    "should serialise correctly" in {
      Json.toJson(culture).toString() shouldBe cultureEnumAsString
    }

    "should deserialise correctly" in {
      Json.fromJson[Swatch](Json.parse(cultureEnumAsString)).get shouldBe culture
    }

  }
}
