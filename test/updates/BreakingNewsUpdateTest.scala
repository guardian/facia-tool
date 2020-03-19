package updates

import org.scalatest.{FreeSpec, Matchers}
import com.gu.mobile.notifications.client.models.Topic._
import updates.BreakingNewsUpdate.CovidGlobalTopicName

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
      BreakingNewsUpdate.createPayload(ukTrail, exampleEmail).title shouldBe None
    }

    "should add titles for individual Coronavirus topics" in {
      val ukTrail = createTrail(BreakingNewsCovid19Uk.name)
      BreakingNewsUpdate.createPayload(ukTrail, exampleEmail).title shouldBe Some("Coronavirus")

      val usTrail = createTrail(BreakingNewsCovid19Us.name)
      BreakingNewsUpdate.createPayload(usTrail, exampleEmail).title shouldBe Some("Coronavirus")

      val auTrail = createTrail(BreakingNewsCovid19Au.name)
      BreakingNewsUpdate.createPayload(auTrail, exampleEmail).title shouldBe Some("Coronavirus")

      val internationalTrail = createTrail(BreakingNewsCovid19International.name)
      BreakingNewsUpdate.createPayload(internationalTrail, exampleEmail).title shouldBe Some("Coronavirus")
    }

    "should add titles for global Coronavirus topic" in {
      val globalTrail = createTrail(CovidGlobalTopicName)
      BreakingNewsUpdate.createPayload(globalTrail, exampleEmail).title shouldBe Some("Coronavirus")
    }
  }
}
