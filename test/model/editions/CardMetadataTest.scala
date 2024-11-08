package model.editions

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json

class CardMetadataTest extends FreeSpec with Matchers {

  val cardMetadata = EditionsArticleMetadata(
    Some("headline"),
    Some("customKicker"),
    Some("trailText"),
    Some(true),
    Some(true),
    Some("byline"),
    None,
    Some(MediaType.Hide),
    Some(
      Image(
        Some(1),
        Some(2),
        "origin",
        "src",
        Some("thumb")
      )
    ),
    Some(
      Image(
        Some(3),
        Some(4),
        "origin2",
        "src2",
        Some("thumb2")
      )
    ),
    Some(true),
    None,
    None
  )

  private val cardMetadataAsString =
    """
      |{"headline":"headline",
      | "customKicker":"customKicker",
      | "trailText":"trailText",
      | "showQuotedHeadline":true,
      | "showByline":true,
      | "byline":"byline",
      | "mediaType":"hide",
      | "cutoutImage":{
      |     "height":1,
      |     "width":2,
      |     "origin":"origin",
      |     "src":"src",
      |     "thumb":"thumb"
      | },
      | "replaceImage":{
      |   "height":3,
      |   "width":4,
      |   "origin":"origin2",
      |   "src":"src2",
      |   "thumb":"thumb2"
      | },
      | "overrideArticleMainMedia":true}
    """.stripMargin
      .split('\n')
      .map(_.trim)
      .mkString // remove leading/trailing whitespace and join into a single string

  "Card Metadata Data to/from Json" - {

    "should serialise correctly" in {
      Json.toJson(cardMetadata).toString() shouldBe cardMetadataAsString
    }

    "should deserialise correctly" in {
      Json
        .fromJson[EditionsArticleMetadata](Json.parse(cardMetadataAsString))
        .get shouldBe cardMetadata
    }

  }

}
