package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json

class SwatchTest extends FreeSpec with Matchers {

  "Swatch Data (Culture)" - {
    val cultureEnumAsString = "\"culture\""
    val culture = Swatch.Culture

    "should serialise correctly" in {
      Json.toJson(culture).toString() shouldBe cultureEnumAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[Swatch](Json.parse(cultureEnumAsString))
        .get shouldBe culture
    }
  }

  "Swatch Data (Neutral)" - {
    val neutralEnumAsString = "\"neutral\""
    val neutral = Swatch.Neutral

    "should serialise correctly" in {
      Json.toJson(neutral).toString() shouldBe neutralEnumAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[Swatch](Json.parse(neutralEnumAsString))
        .get shouldBe neutral
    }
  }

  "Swatch Data (News)" - {

    val newsEnumAsString = "\"news\""
    val news = Swatch.News

    "should serialise correctly" in {
      Json.toJson(news).toString() shouldBe newsEnumAsString
    }

    "should deserialise correctly" in {
      Json.fromJson[Swatch](Json.parse(newsEnumAsString)).get shouldBe news
    }
  }

  "Swatch Data (Opinion)" - {

    val opinionEnumAsString = "\"opinion\""
    val opinion = Swatch.Opinion

    "should serialise correctly" in {
      Json.toJson(opinion).toString() shouldBe opinionEnumAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[Swatch](Json.parse(opinionEnumAsString))
        .get shouldBe opinion
    }
  }

  "Swatch Data (Lifestyle)" - {

    val lifestyleEnumAsString = "\"lifestyle\""
    val lifestyle = Swatch.Lifestyle

    "should serialise correctly" in {
      Json.toJson(lifestyle).toString() shouldBe lifestyleEnumAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[Swatch](Json.parse(lifestyleEnumAsString))
        .get shouldBe lifestyle
    }
  }

  "Swatch Data (Sport)" - {

    val sportEnumAsString = "\"sport\""
    val sport = Swatch.Sport

    "should serialise correctly" in {
      Json.toJson(sport).toString() shouldBe sportEnumAsString
    }

    "should deserialise correctly" in {
      Json.fromJson[Swatch](Json.parse(sportEnumAsString)).get shouldBe sport
    }
  }

}
