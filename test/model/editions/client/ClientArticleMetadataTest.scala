package model.editions.client

import model.editions.{ArticleMetadata, Image, MediaType}
import org.scalatest.{FreeSpec, Matchers}

class ClientArticleMetadataTest extends FreeSpec with Matchers {
  "ClientArticleMetadata from ArticleMetadata" - {
    "should serialise from a simple ArticleMetadata" in {
      val articleMetadata = ArticleMetadata(
        Some("Britain has summer!"),
        Some("Breaking News"),
        Some("Goneth the rain, cometh the sun"),
        None,
        None,
        None,
        None,
        None,
        None,
        None
      )

      val clientArticleMetadata = ClientArticleMetadata.fromArticleMetadata(articleMetadata)

      clientArticleMetadata.headline.isDefined shouldBe true
      clientArticleMetadata.headline.get shouldBe "Britain has summer!"

      clientArticleMetadata.customKicker.isDefined shouldBe true
      clientArticleMetadata.customKicker.get shouldBe "Breaking News"

      clientArticleMetadata.trailText.isDefined shouldBe true
      clientArticleMetadata.trailText.get shouldBe "Goneth the rain, cometh the sun"

      clientArticleMetadata.imageHide shouldBe None
      clientArticleMetadata.imageReplace shouldBe None
      clientArticleMetadata.imageCutoutReplace shouldBe None
    }

    "should persist cutout image when selected override is hide image" in {
      val articleMetadata = ArticleMetadata(
        Some("New Pokemon discovered"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Hide),
        Some(Image(Some(100), Some(100), "file://origin-new-pokemon.gif", "file://new-pokemon.gif")),
        None
      )

      val clientArticleMetadata = ClientArticleMetadata.fromArticleMetadata(articleMetadata)

      clientArticleMetadata.headline.isDefined shouldBe true
      clientArticleMetadata.headline.get shouldBe "New Pokemon discovered"

      clientArticleMetadata.imageHide shouldBe Some(true)

      clientArticleMetadata.imageCutoutReplace shouldBe Some(false)
      clientArticleMetadata.imageCutoutSrcOrigin shouldBe Some("file://origin-new-pokemon.gif")
      clientArticleMetadata.imageCutoutSrc shouldBe Some("file://new-pokemon.gif")
      clientArticleMetadata.imageCutoutSrcHeight shouldBe Some("100")
      clientArticleMetadata.imageCutoutSrcWidth shouldBe Some("100")

      clientArticleMetadata.imageReplace shouldBe None
    }

    "should persist slideshow images when selected override is replace image" in {
      val articleMetadata = ArticleMetadata(
        Some("Elephants declared best animal"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Image),
        None,
        Some(Image(Some(100), Some(100), "file://elephant.jpg", "file://elephant.png")),
      )

      val clientArticleMetadata = ClientArticleMetadata.fromArticleMetadata(articleMetadata)

      clientArticleMetadata.headline.isDefined shouldBe true
      clientArticleMetadata.headline.get shouldBe "Elephants declared best animal"

      clientArticleMetadata.imageReplace shouldBe Some(true)
      clientArticleMetadata.imageSrc shouldBe Some("file://elephant.png")
      clientArticleMetadata.imageSrcOrigin shouldBe Some("file://elephant.jpg")
      clientArticleMetadata.imageSrcHeight shouldBe Some("100")
      clientArticleMetadata.imageSrcWidth shouldBe Some("100")

      clientArticleMetadata.imageHide shouldBe None
    }

    "should only set an image override boolean if its fields are also set" in {
      val articleMetadata = ArticleMetadata(
        Some("Teenage Mutant Ninja Turtles"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Image),
        None,
        None
      )

      val clientArticleMetadata = ClientArticleMetadata.fromArticleMetadata(articleMetadata)

      clientArticleMetadata.imageReplace shouldBe None
    }

    "should explicitly set cutout to false if media type is set but not to a cutout" in {
      val articleMetadata = ArticleMetadata(
        Some("Teenage Mutant Ninja Turtles"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.UseArticleTrail),
        None,
        None
      )

      val clientArticleMetadata = ClientArticleMetadata.fromArticleMetadata(articleMetadata)

      clientArticleMetadata.imageCutoutReplace shouldBe Some(false)
    }
  }

  "ClientArticleMetadata to ArticleMetadata" - {
    "should convert into ArticleMetadata with multiple image overrides" in {
      val cam = ClientArticleMetadata(
        Some("New Harry Potter book being written"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some("J.K"),
        None,
        Some(true),
        Some("file://lightning.jpg"),
        Some("100"),
        Some("100"),
        Some("file://lightning.gif"),
        Some("file://lightning.png"),
        Some(false),
        Some("file://broom.jpg"),
        Some("100"),
        Some("100"),
        Some("file://broom.gif")
      )

      val articleMetadata = cam.toArticleMetadata

      articleMetadata.headline.isDefined shouldBe true
      articleMetadata.headline.get shouldBe "New Harry Potter book being written"

      articleMetadata.mediaType.isDefined shouldBe true
      articleMetadata.mediaType.get shouldBe MediaType.Image
      articleMetadata.replaceImage shouldBe Some(Image(
        Some(100),
        Some(100),
        "file://lightning.gif",
        "file://lightning.jpg",
        Some("file://lightning.png")
      ))

      articleMetadata.cutoutImage shouldBe Some(Image(
        Some(100),
        Some(100),
        "file://broom.gif",
        "file://broom.jpg"
      ))
    }
  }
}
