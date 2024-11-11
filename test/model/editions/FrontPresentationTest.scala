package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.{Format, Json, Reads, Writes}

class FrontPresentationTest extends FreeSpec with Matchers {

  val frontPresentationAsString = "{\"swatch\":\"culture\"}"
  val presentation = FrontPresentation(Swatch.Culture)

  "FrontPresentation Data" - {

    "should serialise correctly" in {
      Json.toJson(presentation).toString() shouldBe frontPresentationAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[FrontPresentation](Json.parse(frontPresentationAsString))
        .get shouldBe presentation
    }

  }
}
