package logic

import com.gu.contentapi.client.model.v1.{
  Content,
  ContentFields,
  ContentType,
  Tag,
  TagType
}
import org.scalatest.{FreeSpec, Matchers}

class CapiPrefillerTest extends FreeSpec with Matchers {

  val emptyContent = Content(
    "id",
    ContentType.Article,
    None,
    None,
    None,
    "webTitle",
    "webUrl",
    "apiUrl",
    None, // fields: _root_.scala.Option[com.gu.contentapi.client.model.v1.ContentFields] = _root_.scala.None,
    Seq(), // tags
    None,
    Seq(),
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    false,
    None,
    None
  )

  val emptyTag = Tag(
    "id",
    TagType.Tone,
    None,
    None,
    "webTitle",
    "webUrl",
    "apiUrl",
    Seq(),
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

  val emptyFields = ContentFields(
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

  "Prefill can find first contributor with a cutout" - {
    "Can handle empty list" in {
      CapiPrefiller.getFirstContributorWithCutoutOption(
        emptyContent.copy(tags = Seq())
      ) shouldBe (None)
    }

    "Can handle single list" in {
      val nothingUseful = emptyTag.copy(`type` = TagType.Tone)
      CapiPrefiller.getFirstContributorWithCutoutOption(
        emptyContent.copy(tags = Seq(nothingUseful))
      ) shouldBe (None)
    }

    "Can handle multiple list with single contributor" in {
      val somethingUseful = emptyTag
        .copy(`type` = TagType.Contributor)
        .copy(bylineLargeImageUrl = Some("string"))
      CapiPrefiller.getFirstContributorWithCutoutOption(
        emptyContent.copy(tags = Seq(somethingUseful))
      ) shouldBe (Some("string"))
    }

    "Can handle multiple list with multiple contributor" in {
      val somethingUseful = emptyTag
        .copy(`type` = TagType.Contributor)
        .copy(bylineLargeImageUrl = Some("string1"))
      val somethingIrrelevant = emptyTag
        .copy(`type` = TagType.Contributor)
        .copy(bylineLargeImageUrl = Some("string2"))
      CapiPrefiller.getFirstContributorWithCutoutOption(
        emptyContent.copy(tags = Seq(somethingUseful, somethingIrrelevant))
      ) shouldBe (Some("string1"))
    }
  }

  "pickKicker can pick correct kicker text" - {
    "Handle empty content" in {
      CapiPrefiller.pickKicker(emptyContent) shouldBe None
    }
    "Return content from a series tag on its own" in {
      val seriesTag = emptyTag
        .copy(`type` = TagType.Series)
        .copy(webTitle = "this tag!")
      CapiPrefiller.pickKicker(
        emptyContent.copy(tags = Seq(seriesTag))
      ) shouldBe Some("this tag!")
    }
    "Return content from a series tag and a tone tag " in {
      val seriesTag = emptyTag
        .copy(`type` = TagType.Series)
        .copy(webTitle = "this tag!")
      val toneTag = emptyTag
        .copy(`type` = TagType.Tone)
        .copy(webTitle = "this tag too!")
      CapiPrefiller.pickKicker(
        emptyContent.copy(tags = Seq(toneTag, seriesTag))
      ) shouldBe Some("this tag!")
    }
    "Return content from a 'plural' tone tag " in {
      val toneTag = emptyTag
        .copy(`type` = TagType.Tone)
        .copy(id = "tone/letters")
        .copy(webTitle = "Letters")
      CapiPrefiller.pickKicker(
        emptyContent.copy(tags = Seq(toneTag))
      ) shouldBe Some("Letters")
    }
    "Return content from a 'single' tone tag " in {
      val toneTag = emptyTag
        .copy(`type` = TagType.Tone)
        .copy(id = "tone/reviews")
        .copy(webTitle = "Reviews")
      CapiPrefiller.pickKicker(
        emptyContent.copy(tags = Seq(toneTag))
      ) shouldBe Some("Review")
    }
    "Return content from a 'byline' tone tag " in {
      val toneTag = emptyTag
        .copy(`type` = TagType.Tone)
        .copy(id = "tone/comment")
      val content = emptyContent
        .copy(tags = Seq(toneTag))
        .copy(fields = Some(emptyFields.copy(byline = Some("Whoever"))))
      CapiPrefiller.pickKicker(content) shouldBe Some("Whoever")
    }
    "Return content from a 'first' tag when the first tag is in the title but there is no second tag" in {
      val firstTag = emptyTag
        .copy(webTitle = "first")
      val content = emptyContent
        .copy(webTitle = "Neil Armstrong: first man on the moon")
        .copy(tags = Seq(firstTag))
      CapiPrefiller.pickKicker(content) shouldBe Some("first")
    }
    "Return content from a 'second' tag when the first tag is in the title" in {
      val firstTag = emptyTag
        .copy(webTitle = "first")
      val secondTag = emptyTag
        .copy(webTitle = "second")
      val content = emptyContent
        .copy(webTitle = "Neil Armstrong: first man on the moon")
        .copy(tags = Seq(firstTag, secondTag))
      CapiPrefiller.pickKicker(content) shouldBe Some("second")
    }
    "Return content from a 'first' tag when the first and second tags are in the title" in {
      val firstTag = emptyTag
        .copy(webTitle = "first")
      val secondTag = emptyTag
        .copy(webTitle = "second")
      val content = emptyContent
        .copy(webTitle =
          "Neil Armstrong and Buzz Aldrin: first and second men on the moon"
        )
        .copy(tags = Seq(firstTag, secondTag))
      CapiPrefiller.pickKicker(content) shouldBe Some("first")
    }
  }

}
