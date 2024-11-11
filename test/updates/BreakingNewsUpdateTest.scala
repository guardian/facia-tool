package updates

import org.scalatest.{FreeSpec, Matchers}
import com.gu.mobile.notifications.client.models.Topic._

class BreakingNewsUpdateTest extends FreeSpec with Matchers {

  def createTrail(topic: String) = ClientHydratedTrail(
    topic = Some(topic),
    headline = "Example headline",
    group = None,
    isArticle = true,
    thumb = None,
    image = None,
    imageHide = None,
    path = Some("path"),
    shortUrl = None,
    alert = None,
    blockId = None
  )

  val exampleEmail = "editor@guardian.co.uk"

  "createPayload" - {
    "should not add titles for topics that don't need them" in {
      val ukTrail = createTrail(BreakingNewsUk.name)
      BreakingNewsUpdate
        .createPayload(ukTrail, exampleEmail)
        .title shouldBe None
    }
  }
}
