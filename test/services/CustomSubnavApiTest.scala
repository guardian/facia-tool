package services

import com.gu.facia.client.models._
import org.joda.time.DateTime
import org.mockito.Mockito.{verifyNoMoreInteractions, when}
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json

class CustomSubnavApiTest extends FreeSpec with Matchers with MockitoSugar {
  private def subnav(id: String, title: String): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader(title, None, "Copy"),
      format = CustomSubnavFormat.Large,
      links = Nil,
      pages = Nil,
      images = None,
      palette = None,
      lastUpdated = new DateTime(0),
      updatedBy = "Ada Lovelace",
      updatedEmail = "ada@example.com"
    )

  private val published = subnav("published", "Published title")
  private val draft = subnav("draft", "Draft title")
  private val config = CustomSubnavConfig(
    live = List(published),
    draft = List(draft, published.copy(header = draft.header))
  )

  "getPublishedSubnav" - {
    List(
      "published" -> Some(published),
      "missing" -> None
    ).foreach { case (id, expected) =>
      s"resolves $id using only the published config" in {
        val s3 = mock[S3FrontsApi]
        when(s3.getCustomSubnav).thenReturn(
          Some(Json.stringify(Json.toJson(config)))
        )

        new CustomSubnavApi(s3).getPublishedSubnav(id) should be(
          Right(expected)
        )
        org.mockito.Mockito.verify(s3).getCustomSubnav
        verifyNoMoreInteractions(s3)
      }
    }

    "distinguishes a draft-only subnav from a missing subnav" in {
      val s3 = mock[S3FrontsApi]
      when(s3.getCustomSubnav).thenReturn(
        Some(Json.stringify(Json.toJson(config)))
      )

      new CustomSubnavApi(s3).getPublishedSubnav("draft") should be(
        Left(CustomSubnavApi.DraftSubnav)
      )
    }

    "returns not found when no config exists" in {
      val s3 = mock[S3FrontsApi]
      when(s3.getCustomSubnav).thenReturn(None)

      new CustomSubnavApi(s3).getPublishedSubnav("missing") should be(
        Right(None)
      )
    }

    "surfaces malformed stored config rather than returning not found" in {
      val s3 = mock[S3FrontsApi]
      when(s3.getCustomSubnav).thenReturn(Some("invalid JSON"))

      new CustomSubnavApi(s3).getPublishedSubnav("published").isLeft should be(
        true
      )
    }
  }
}
