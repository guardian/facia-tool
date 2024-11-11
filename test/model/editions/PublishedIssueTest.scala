package model.editions

import java.time.{LocalDate, OffsetDateTime, ZoneId, ZoneOffset, ZonedDateTime}

import org.scalatest.{FreeSpec, Matchers, OptionValues}

class PublishedIssueTest extends FreeSpec with Matchers with OptionValues {

  val LondonZone = ZoneId.of("Europe/London")
  val nowDateTime = ZonedDateTime.of(2019, 10, 11, 0, 0, 0, 0, LondonZone)
  val nowMilli = nowDateTime.toInstant.toEpochMilli

  private def issue(
      year: Int,
      month: Int,
      dom: Int,
      fronts: EditionsFront*
  ): EditionsIssue = {
    val date = LocalDate.of(year, month, dom)
    val dateTime = date.atStartOfDay(LondonZone)
    val dateTimeMilli = dateTime.toInstant.toEpochMilli
    EditionsIssue(
      "test-edition",
      Edition.DailyEdition,
      CuratedPlatform.Editions,
      LondonZone.toString,
      date,
      dateTimeMilli,
      "User",
      "user@example.con",
      None,
      None,
      None,
      fronts.zipWithIndex.map { case (f, x) => f.copy(index = x) }.toList,
      supportsProofing = true
    )
  }

  private def front(
      name: String,
      collections: EditionsCollection*
  ): EditionsFront =
    EditionsFront(
      name,
      name,
      0,
      isSpecial = false,
      isHidden = false,
      None,
      None,
      None,
      None,
      collections.toList
    )

  implicit class RichEditionsFront(thisFront: EditionsFront) {
    def hide: EditionsFront = thisFront.copy(isHidden = true)
  }

  private def collection(
      name: String,
      prefill: Option[CapiPrefillQuery],
      cards: EditionsCard*
  ): EditionsCollection =
    EditionsCollection(
      name,
      name,
      isHidden = false,
      None,
      None,
      None,
      prefill,
      None,
      cards.toList
    )

  implicit class RichEditionsCollection(thisCollection: EditionsCollection) {
    def hide: EditionsCollection = thisCollection.copy(isHidden = true)
  }

  private def card(id: String): EditionsCard =
    EditionsArticle(
      id,
      nowMilli,
      Some(EditionsArticleMetadata.default)
    )

  "PublishedCards" - {
    "card fields should be populated correctly" in {
      val now =
        OffsetDateTime.of(2019, 9, 30, 10, 23, 0, 0, ZoneOffset.ofHours(1))
      val card = EditionsArticle("1234456", now.toInstant.toEpochMilli, None)
      val publishedCard = EditionsArticle.toPublishedArticle(card)
      publishedCard.internalPageCode shouldBe 1234456
      publishedCard.furniture shouldBe PublishedFurniture(
        None,
        None,
        None,
        None,
        false,
        false,
        PublishedMediaType.UseArticleTrail,
        None,
        None,
        false,
        None
      )
    }

    "furniture defaults should be populated correctly" in {
      val furniture = EditionsArticleMetadata(
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None
      )
      val card = EditionsArticle("123456", 0, Some(furniture))
      val published = EditionsArticle.toPublishedArticle(card)

      published.furniture shouldBe PublishedFurniture(
        None,
        None,
        None,
        None,
        false,
        false,
        PublishedMediaType.UseArticleTrail,
        None,
        None,
        false,
        None
      )
    }

    val cardImage = Some(
      Image(
        Some(100),
        Some(100),
        "file://origin.jpg",
        "file://src.jpg",
        Some("file://thumb.jpg")
      )
    )
    val cardFurniture = EditionsArticleMetadata(
      Some("headline"),
      Some("kicker"),
      Some("trail-text"),
      Some(true),
      Some(true),
      Some("byline"),
      Some("sport-score"),
      Some(MediaType.Image),
      None,
      Some(
        Image(Some(100), Some(100), "file://image-1.gif", "file://image-1.jpg")
      ),
      Some(false),
      Some(
        CoverCardImages(
          mobile = cardImage,
          tablet = cardImage
        )
      ),
      None
    )

    "furniture should be populated when specified, cover cards should be ignored if the media type isn't set to cover card" in {
      val card = EditionsArticle("123456", 0, Some(cardFurniture))
      val published = EditionsArticle.toPublishedArticle(card)

      published.furniture shouldBe PublishedFurniture(
        Some("kicker"),
        Some("headline"),
        Some("trail-text"),
        Some("byline"),
        showByline = true,
        showQuotedHeadline = true,
        mediaType = PublishedMediaType.Image,
        imageSrcOverride =
          Some(PublishedImage(Some(100), Some(100), "file://image-1.jpg")),
        sportScore = Some("sport-score"),
        overrideArticleMainMedia = false,
        coverCardImages = None
      )
    }

    "furniture should be populated when specified, cover card should be some if media type is covercard " in {
      val card = EditionsArticle(
        "123456",
        0,
        Some(cardFurniture.copy(mediaType = Some(MediaType.CoverCard)))
      )
      val published = EditionsArticle.toPublishedArticle(card)

      val publishedImage =
        PublishedImage(Some(100), Some(100), "file://src.jpg")

      published.furniture shouldBe PublishedFurniture(
        Some("kicker"),
        Some("headline"),
        Some("trail-text"),
        Some("byline"),
        showByline = true,
        showQuotedHeadline = true,
        mediaType = PublishedMediaType.CoverCard,
        imageSrcOverride = None,
        sportScore = Some("sport-score"),
        overrideArticleMainMedia = false,
        coverCardImages =
          Some(PublishedCardImage(publishedImage, publishedImage))
      )
    }

    "media type should fall back if there's an invalid cover card" in {
      val coverCardFurniture = cardFurniture
        .copy(mediaType = Some(MediaType.CoverCard))
        .copy(coverCardImages =
          Some(
            CoverCardImages(
              mobile = cardImage,
              tablet = None
            )
          )
        )

      val swapped = coverCardFurniture.copy(coverCardImages =
        Some(
          CoverCardImages(
            mobile = None,
            tablet = cardImage
          )
        )
      )

      List(
        EditionsArticle("123456", 0, Some(coverCardFurniture)),
        EditionsArticle("123456", 0, Some(swapped))
      ).foreach { a =>
        EditionsArticle
          .toPublishedArticle(a)
          .furniture
          .mediaType shouldBe PublishedMediaType.UseArticleTrail
      }
    }
  }

  "PublishedIssue" - {
    "fronts should be filtered out" in {
      val testIssue = issue(
        2019,
        9,
        30,
        front(
          "uk-news",
          collection("london", None, card("123")),
          collection("financial", None, card("123"))
        ),
        front(
          "culture",
          collection("art", None, card("123")),
          collection("theatre", None, card("123"))
        ),
        front("special", collection("magic", None, card("123"))).hide
      )
      testIssue.fronts.size shouldBe 3
      val publishedIssue =
        testIssue.toPublishableIssue("foo", PublishAction.publish)
      publishedIssue.fronts.size shouldBe 0
    }

  }

  "ProofedIssue" - {
    "fronts should be filtered out when hidden" in {
      val testIssue = issue(
        2019,
        9,
        30,
        front(
          "uk-news",
          collection("london", None, card("123")),
          collection("financial", None, card("123"))
        ),
        front(
          "culture",
          collection("art", None, card("123")),
          collection("theatre", None, card("123"))
        ),
        front("special", collection("magic", None, card("123"))).hide
      )
      testIssue.fronts.size shouldBe 3
      val publishedIssue =
        testIssue.toPublishableIssue("foo", PublishAction.proof)
      publishedIssue.fronts.size shouldBe 2
      publishedIssue.fronts.find(_.name == "special") shouldBe None
    }

    "fronts should be filtered out when empty" in {
      val testIssue = issue(
        2019,
        9,
        30,
        front("uk-news"),
        front(
          "culture",
          collection("art", None, card("123")),
          collection("theatre", None, card("123"))
        ),
        front("empty")
      )
      testIssue.fronts.size shouldBe 3
      val publishedIssue =
        testIssue.toPublishableIssue("foo", PublishAction.proof)
      publishedIssue.fronts.size shouldBe 1
      publishedIssue.fronts
        .find(_.name == "culture")
        .value
        .collections
        .size shouldBe 2
    }

    "fronts should be filtered out when it only contains empty collections" in {
      val testIssue = issue(
        2019,
        9,
        30,
        front(
          "uk-news",
          collection("london", None),
          collection("financial", None)
        ),
        front(
          "culture",
          collection("art", None, card("123")),
          collection("theatre", None, card("123"))
        ),
        front("empty")
      )
      testIssue.fronts.size shouldBe 3
      val publishedIssue =
        testIssue.toPublishableIssue("foo", PublishAction.proof)
      publishedIssue.fronts.size shouldBe 1
      publishedIssue.fronts
        .find(_.name == "culture")
        .value
        .collections
        .size shouldBe 2
    }
  }

  "PublishedFront" - {
    "collections should be filtered out when hidden" in {
      val testFront = front(
        "uk-news",
        collection("london", None, card("123")),
        collection("financial", None, card("123")),
        collection("special", None, card("123")).hide,
        collection("weather", None, card("123"))
      )

      testFront.collections.size shouldBe 4
      testFront.collections.find(_.id == "special").value

      val publishedFront = testFront.toPublishedFront
      publishedFront.collections.size shouldBe 3
      publishedFront.collections.find(_.id == "special") shouldBe None
    }

    "collections should be filtered out when empty" in {
      val testFront = front(
        "uk-news",
        collection("london", None, card("123")),
        collection("financial", None, card("123")),
        collection("weather", None)
      )

      testFront.collections.size shouldBe 3
      testFront.collections.find(_.id == "weather").value

      val publishedFront = testFront.toPublishedFront
      publishedFront.collections.size shouldBe 2
      publishedFront.collections.find(_.id == "weather") shouldBe None
    }

    "collection displayName should be provided" in {
      val test = EditionsCollection(
        "id",
        "Display Name",
        isHidden = false,
        None,
        None,
        None,
        None,
        None,
        List(card("123"))
      )
      val testFront =
        front("uk-news", collection("london", None, card("123")), test)

      val publishedFront = testFront.toPublishedFront
      publishedFront.collections.size shouldBe 2
      val publishedTestCollection =
        publishedFront.collections.find(_.id == "id").value
      publishedTestCollection.name shouldBe "Display Name"
    }

    "Fronts should not override name if there's not one defined" in {
      val front = EditionsFront(
        "id",
        "Original Name",
        0,
        false,
        false,
        None,
        None,
        None,
        Some(EditionsFrontMetadata(None, None)),
        Nil
      )

      val published = front.toPublishedFront

      published shouldBe PublishedFront(
        "id",
        "Original Name",
        Nil,
        Swatch.Neutral
      )
    }

    "Front name should be overridden correctly" in {
      val front = EditionsFront(
        "id",
        "Original Name",
        0,
        false,
        false,
        None,
        None,
        None,
        Some(EditionsFrontMetadata(Some("New Name"), None)),
        Nil
      )

      val published = front.toPublishedFront

      published shouldBe PublishedFront("id", "New Name", Nil, Swatch.Neutral)
    }
  }
}
