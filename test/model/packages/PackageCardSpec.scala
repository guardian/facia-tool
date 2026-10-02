package model.packages

import model.editions.{EditionsChefMetadata, EditionsFeastCollectionMetadata}
import org.scalatest.{FreeSpec, Matchers, OptionValues}
import play.api.libs.json.{JsObject, Json, Writes}

import java.time.{Instant, OffsetDateTime}

class PackageCardSpec extends FreeSpec with Matchers with OptionValues {

  private val testInstant: OffsetDateTime =
    OffsetDateTime.parse("2024-11-14T09:30:00Z")

  "PackageCard JSON serialization" - {

    "PackageRecipeCard" - {
      "should roundtrip: serialize and deserialize back to original" in {
        val original = PackageRecipeCard(
          id = "recipe-123",
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format.reads(json).get

        deserialized shouldEqual original
        deserialized.cardType shouldBe PackageCardType.Recipe
      }

      "should include cardType in JSON" in {
        val card = PackageRecipeCard(
          id = "recipe-456",
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(card).as[JsObject]
        (json \ "cardType").as[String] shouldBe "recipe"
      }

      "should roundtrip multiple instances independently" in {
        val card1 = PackageRecipeCard(
          id = "recipe-abc",
          addedOn = testInstant
        )
        val card2 = PackageRecipeCard(
          id = "recipe-xyz",
          addedOn = testInstant.plusSeconds(3600)
        )

        val json1 = PackageCard.format.writes(card1)
        val json2 = PackageCard.format.writes(card2)

        val deserialized1 = PackageCard.format.reads(json1).get
        val deserialized2 = PackageCard.format.reads(json2).get

        deserialized1 shouldEqual card1
        deserialized2 shouldEqual card2
        deserialized1 should not equal deserialized2
      }
    }

    "PackageChefCard" - {
      "should roundtrip without metadata" in {
        val original = PackageChefCard(
          id = "chef-123",
          metadata = None,
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format.reads(json).get

        deserialized shouldEqual original
        deserialized.cardType shouldBe PackageCardType.Chef
      }

      "should roundtrip with metadata" in {
        val metadata = EditionsChefMetadata(
          bio = Some("Celebrity chef specializing in modern cuisine"),
          theme = None,
          chefImageOverride = None
        )
        val original = PackageChefCard(
          id = "chef-456",
          metadata = Some(metadata),
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format.reads(json).get

        deserialized shouldEqual original
        deserialized.asInstanceOf[PackageChefCard].metadata shouldEqual Some(
          metadata
        )
      }

      "should include cardType in JSON" in {
        val card = PackageChefCard(
          id = "chef-789",
          metadata = None,
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(card).as[JsObject]
        (json \ "cardType").as[String] shouldBe "chef"
      }

      "should handle complex metadata roundtrip" in {
        val metadata = EditionsChefMetadata(
          bio = Some("Award-winning chef"),
          theme = None,
          chefImageOverride = None
        )
        val original = PackageChefCard(
          id = "chef-complex",
          metadata = Some(metadata),
          addedOn = testInstant.plusSeconds(1000)
        )

        val json = PackageCard.format.writes(original)
        val deserialized =
          PackageCard.format.reads(json).get.asInstanceOf[PackageChefCard]

        deserialized.id shouldEqual original.id
        deserialized.addedOn shouldEqual original.addedOn
        deserialized.metadata.value.bio shouldEqual metadata.bio
      }
    }

    "PackageSubcollectionCard" - {
      "should roundtrip without metadata" in {
        val original = PackageSubcollectionCard(
          id = "subcoll-123",
          metadata = None,
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format.reads(json).get

        deserialized shouldEqual original
        deserialized.cardType shouldBe PackageCardType.Subcollection
      }

      "should roundtrip with metadata" in {
        val metadata = EditionsFeastCollectionMetadata(
          title = Some("Collection of recipes"),
          theme = None,
          collectionItems = List()
        )
        val original = PackageSubcollectionCard(
          id = "subcoll-456",
          metadata = Some(metadata),
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format.reads(json).get

        deserialized shouldEqual original
        deserialized
          .asInstanceOf[PackageSubcollectionCard]
          .metadata shouldEqual Some(metadata)
      }

      "should include cardType in JSON" in {
        val card = PackageSubcollectionCard(
          id = "subcoll-789",
          metadata = None,
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(card).as[JsObject]
        (json \ "cardType").as[String] shouldBe "subcollection"
      }

      "should handle metadata with title" in {
        val metadata = EditionsFeastCollectionMetadata(
          title = Some("Festive Feasts"),
          theme = None,
          collectionItems = List()
        )
        val original = PackageSubcollectionCard(
          id = "subcoll-festive",
          metadata = Some(metadata),
          addedOn = testInstant.plusSeconds(500)
        )

        val json = PackageCard.format.writes(original)
        val deserialized = PackageCard.format
          .reads(json)
          .get
          .asInstanceOf[PackageSubcollectionCard]

        deserialized.id shouldEqual original.id
        deserialized.addedOn shouldEqual original.addedOn
        deserialized.metadata.value.title shouldEqual metadata.title
      }
    }

    "Polymorphic PackageCard" - {
      "should correctly deserialize Recipe from JSON string" in {
        val jsonStr =
          """{"id":"recipe-1","addedOn":"2024-11-14T09:30:00Z","cardType":"recipe"}"""
        val json = Json.parse(jsonStr)
        val card = Json.fromJson[PackageCard](json).get

        card shouldBe a[PackageRecipeCard]
        card.cardType shouldBe PackageCardType.Recipe
        card.id shouldBe "recipe-1"
      }

      "should correctly deserialize Chef from JSON string" in {
        val jsonStr =
          """{"id":"chef-1","metadata":{"bio":"Master chef"},"addedOn":"2024-11-14T09:30:00Z","cardType":"chef"}"""
        val json = Json.parse(jsonStr)
        val card = Json.fromJson[PackageCard](json).get

        card shouldBe a[PackageChefCard]
        card.cardType shouldBe PackageCardType.Chef
        card.asInstanceOf[PackageChefCard].metadata.value.bio shouldBe Some(
          "Master chef"
        )
      }

      "should correctly deserialize Subcollection from JSON string" in {
        val jsonStr =
          """{"id":"subcoll-1","metadata":{"title":"My Collection","collectionItems": []},"addedOn":"2024-11-14T09:30:00Z","cardType":"subcollection"}"""
        val json = Json.parse(jsonStr)
        val card = Json.fromJson[PackageCard](json).get

        card shouldBe a[PackageSubcollectionCard]
        card.cardType shouldBe PackageCardType.Subcollection
        card
          .asInstanceOf[PackageSubcollectionCard]
          .metadata
          .value
          .title shouldBe Some(
          "My Collection"
        )
      }

      "should fail on unknown cardType" in {
        val jsonStr =
          """{"id":"test-1","cardType":"unknown","addedOn":"2024-11-14T09:30:00Z"}"""
        val json = Json.parse(jsonStr)
        val result = Json.fromJson[PackageCard](json)

        result.isError shouldBe true
      }

      "should fail when cardType is missing" in {
        val jsonStr = """{"id":"test-1","addedOn":"2024-11-14T09:30:00Z"}"""
        val json = Json.parse(jsonStr)
        val result = Json.fromJson[PackageCard](json)

        result.isError shouldBe true
      }
    }

    "Mixed collections of PackageCard" - {
      "should roundtrip a list of heterogeneous PackageCards" in {
        val cards: List[PackageCard] = List(
          PackageRecipeCard(id = "recipe-1", addedOn = testInstant),
          PackageChefCard(
            id = "chef-1",
            metadata = Some(EditionsChefMetadata(bio = Some("Chef"))),
            addedOn = testInstant
          ),
          PackageSubcollectionCard(
            id = "subcoll-1",
            metadata =
              Some(EditionsFeastCollectionMetadata(title = Some("Title"))),
            addedOn = testInstant
          )
        )

        val json = Json.toJson(cards)(implicitly[Writes[List[PackageCard]]])
        val deserialized = Json.fromJson[List[PackageCard]](json).get

        deserialized should have length 3
        deserialized.head shouldBe a[PackageRecipeCard]
        deserialized(1) shouldBe a[PackageChefCard]
        deserialized(2) shouldBe a[PackageSubcollectionCard]
        deserialized shouldEqual cards
      }
    }

    "JSON structure consistency" - {
      "should maintain all fields during roundtrip" in {
        val original = PackageChefCard(
          id = "chef-verify",
          metadata = Some(EditionsChefMetadata(bio = Some("Test bio"))),
          addedOn = testInstant
        )

        val json = PackageCard.format.writes(original).as[JsObject]

        // Verify all expected fields exist
        (json \ "id").isDefined shouldBe true
        (json \ "metadata").isDefined shouldBe true
        (json \ "addedOn").isDefined shouldBe true
        (json \ "cardType").isDefined shouldBe true

        // Verify values
        (json \ "id").as[String] shouldEqual "chef-verify"
        (json \ "cardType").as[String] shouldEqual "chef"
        (json \ "addedOn").as[String] shouldEqual "2024-11-14T09:30:00Z"
      }

      "should serialize Instant correctly" in {
        val instant = OffsetDateTime.parse("2025-01-15T14:45:30Z")
        val card = PackageRecipeCard(id = "recipe-time", addedOn = instant)

        val json = PackageCard.format.writes(card)
        val deserialized = PackageCard.format.reads(json).get

        deserialized.addedOn shouldEqual instant
      }
    }
  }
}
