package model.editions.client

import model.editions.{
  EditionsArticleMetadata,
  CoverCardImages,
  Image,
  MediaType
}
import org.scalatest.{FreeSpec, Matchers}

class ClientCardMetadataTest extends FreeSpec with Matchers {

  "ClientCardMetadata from CardMetadata" - {

    "should recover promotion metric from a simple CardMetadata" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("Britain has summer!"),
        Some("Breaking News"),
        Some("Goneth the rain, cometh the sun"),
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        Some(1)
      )
      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)
      clientCardMetadata.promotionMetric should be(Some(1))
    }

    "should send promotion metric to a simple CardMetadata" in {
      val clientCardMetadata = ClientCardMetadata(
        Some("Britain has summer!"),
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
        Some(1),
        None,
        None,
        None
      )
      val cardMetadata = clientCardMetadata.toArticleMetadata
      cardMetadata.promotionMetric should be(Some(1))
    }

    "should serialise from a simple CardMetadata" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("Britain has summer!"),
        Some("Breaking News"),
        Some("Goneth the rain, cometh the sun"),
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

      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)

      clientCardMetadata.headline.isDefined shouldBe true
      clientCardMetadata.headline.get shouldBe "Britain has summer!"

      clientCardMetadata.customKicker.isDefined shouldBe true
      clientCardMetadata.customKicker.get shouldBe "Breaking News"

      clientCardMetadata.trailText.isDefined shouldBe true
      clientCardMetadata.trailText.get shouldBe "Goneth the rain, cometh the sun"

      clientCardMetadata.imageHide shouldBe None
      clientCardMetadata.imageReplace shouldBe None
      clientCardMetadata.imageCutoutReplace shouldBe None
      clientCardMetadata.overrideArticleMainMedia shouldBe None
    }

    "should persist cutout image when selected override is hide image" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("New Pokemon discovered"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Hide),
        Some(
          Image(
            Some(100),
            Some(100),
            "file://origin-new-pokemon.gif",
            "file://new-pokemon.gif"
          )
        ),
        None,
        None,
        None,
        None
      )

      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)

      clientCardMetadata.headline.isDefined shouldBe true
      clientCardMetadata.headline.get shouldBe "New Pokemon discovered"

      clientCardMetadata.imageHide shouldBe Some(true)

      clientCardMetadata.imageCutoutReplace shouldBe Some(false)
      clientCardMetadata.imageCutoutSrcOrigin shouldBe Some(
        "file://origin-new-pokemon.gif"
      )
      clientCardMetadata.imageCutoutSrc shouldBe Some("file://new-pokemon.gif")
      clientCardMetadata.imageCutoutSrcHeight shouldBe Some("100")
      clientCardMetadata.imageCutoutSrcWidth shouldBe Some("100")

      clientCardMetadata.imageReplace shouldBe None
      clientCardMetadata.overrideArticleMainMedia shouldBe None
    }

    "should persist slideshow images when selected override is replace image" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("Elephants declared best animal"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Image),
        None,
        Some(
          Image(
            Some(100),
            Some(100),
            "file://elephant.jpg",
            "file://elephant.png"
          )
        ),
        None,
        None,
        None
      )

      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)

      clientCardMetadata.headline.isDefined shouldBe true
      clientCardMetadata.headline.get shouldBe "Elephants declared best animal"

      clientCardMetadata.imageReplace shouldBe Some(true)
      clientCardMetadata.imageSrc shouldBe Some("file://elephant.png")
      clientCardMetadata.imageSrcOrigin shouldBe Some("file://elephant.jpg")
      clientCardMetadata.imageSrcHeight shouldBe Some("100")
      clientCardMetadata.imageSrcWidth shouldBe Some("100")

      clientCardMetadata.imageHide shouldBe None
    }

    "should only set an image override boolean if its fields are also set" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("Teenage Mutant Ninja Turtles"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.Image),
        None,
        None,
        None,
        None,
        None
      )

      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)

      clientCardMetadata.imageReplace shouldBe None
    }

    "should explicitly set cutout to false if media type is set but not to a cutout" in {
      val cardMetadata = EditionsArticleMetadata(
        Some("Teenage Mutant Ninja Turtles"),
        None,
        None,
        None,
        None,
        None,
        None,
        Some(MediaType.UseArticleTrail),
        None,
        None,
        None,
        None,
        None
      )

      val clientCardMetadata = ClientCardMetadata.fromCardMetadata(cardMetadata)

      clientCardMetadata.imageCutoutReplace shouldBe Some(false)
    }
  }

  "ClientCardMetadata to CardMetadata" - {

    def getEmptyClientCardMetadata = ClientCardMetadata(
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
      None,
      None,
      None,
      None
    )

    "should convert into CardMetadata with multiple image overrides" in {
      val cardMetadata = getEmptyClientCardMetadata
        .copy(headline = Some("New Harry Potter book being written"))
        .copy(sportScore = Some("J.K"))
        .copy(imageReplace = Some(true))
        .copy(imageSrc = Some("file://lightning.jpg"))
        .copy(imageSrcHeight = Some("100"))
        .copy(imageSrcWidth = Some("100"))
        .copy(imageSrcOrigin = Some("file://lightning.gif"))
        .copy(imageSrcThumb = Some("file://lightning.png"))
        .copy(imageCutoutReplace = Some(false))
        .copy(imageCutoutSrc = Some("file://broom.jpg"))
        .copy(imageCutoutSrcHeight = Some("100"))
        .copy(imageCutoutSrcWidth = Some("100"))
        .copy(imageCutoutSrcOrigin = Some("file://broom.gif"))
        .toArticleMetadata

      cardMetadata.headline.isDefined shouldBe true
      cardMetadata.headline.get shouldBe "New Harry Potter book being written"

      cardMetadata.mediaType.isDefined shouldBe true
      cardMetadata.mediaType.get shouldBe MediaType.Image
      cardMetadata.replaceImage shouldBe Some(
        Image(
          Some(100),
          Some(100),
          "file://lightning.gif",
          "file://lightning.jpg",
          Some("file://lightning.png")
        )
      )

      cardMetadata.cutoutImage shouldBe Some(
        Image(
          Some(100),
          Some(100),
          "file://broom.gif",
          "file://broom.jpg"
        )
      )

      cardMetadata.overrideArticleMainMedia shouldBe None
    }

    "should convert into CardMetadata without all the image information" in {
      val cardMetadata = getEmptyClientCardMetadata
        .copy(imageReplace = Some(true))
        .copy(imageSrc = Some("file://lightning.jpg"))
        .copy(imageSrcHeight = Some("100"))
        .copy(imageSrcWidth = Some("100"))
        .copy(imageSrcOrigin = Some("file://lightning.gif"))
        .copy(imageSrcThumb = Some("file://lightning.png"))
        .copy(imageCutoutReplace = Some(false))
        .copy(imageCutoutSrc = Some("file://broom.jpg"))
        .copy(coverCardMobileImage =
          Some(
            Image(
              Some(100),
              Some(100),
              "file://origin.png",
              "file://src.png",
              Some("file://thumb.png")
            )
          )
        )
        .copy(coverCardTabletImage =
          Some(
            Image(
              Some(100),
              Some(100),
              "file://origin.png",
              "file://src.png",
              Some("file://thumb.png")
            )
          )
        )
        .toArticleMetadata

      cardMetadata.mediaType.isDefined shouldBe true
      cardMetadata.mediaType.get shouldBe MediaType.Image
      cardMetadata.replaceImage shouldBe Some(
        Image(
          Some(100),
          Some(100),
          "file://lightning.gif",
          "file://lightning.jpg",
          Some("file://lightning.png")
        )
      )

      cardMetadata.cutoutImage shouldBe Some(
        Image(
          None,
          None,
          "file://broom.jpg",
          "file://broom.jpg"
        )
      )

      cardMetadata.coverCardImages shouldBe Some(
        CoverCardImages(
          mobile = Some(
            Image(
              Some(100),
              Some(100),
              "file://origin.png",
              "file://src.png",
              Some("file://thumb.png")
            )
          ),
          tablet = Some(
            Image(
              Some(100),
              Some(100),
              "file://origin.png",
              "file://src.png",
              Some("file://thumb.png")
            )
          )
        )
      )
    }
  }

}
