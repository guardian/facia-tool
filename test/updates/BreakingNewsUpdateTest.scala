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
      val trail = createTrail("FAKE TOPIC")
      BreakingNewsUpdate
        .createPayload(trail, exampleEmail)
        .title shouldBe None
    }

    "should set title to 'UK general election' for uk-general-election topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail("uk-general-election"), exampleEmail)
        .title shouldBe Some("UK general election")
    }

    "should set title to 'Breaking news' for global breaking news topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail(BreakingNewsUpdate.BreakingNewsGlobalTopicName), exampleEmail)
        .title shouldBe Some("Breaking news")
    }

    "should set title to 'Breaking news' for regional breaking news topics" in {
      val breakingNewsTopicNames = BreakingNewsUpdate.BreakingNewsTopics.map(_.name)
      breakingNewsTopicNames.foreach { topicName =>
        BreakingNewsUpdate
          .createPayload(createTrail(topicName), exampleEmail)
          .title shouldBe Some("Breaking news")
      }
    }

    "should set title to 'Sports news' for US sport breaking news topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail(BreakingNewsSportUs.name), exampleEmail)
        .title shouldBe Some("Sports news")
    }

    "should set title to 'Sport news' for global sport topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail(BreakingNewsUpdate.SportGlobalTopicName), exampleEmail)
        .title shouldBe Some("Sport news")
    }

    "should set title to 'Sport news' for regional sport topics" in {
      val sportTopicNames = BreakingNewsUpdate.SportBreakingNewsTopics.map(_.name)
        .filterNot(_ == BreakingNewsSportUs.name) // US sport is handled separately as "Sports news"
      sportTopicNames.foreach { topicName =>
        BreakingNewsUpdate
          .createPayload(createTrail(topicName), exampleEmail)
          .title shouldBe Some("Sport news")
      }
    }

    "should set title to 'Editors' pick' for global editors picks topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail(BreakingNewsUpdate.EditorsPicksGlobalTopicName), exampleEmail)
        .title shouldBe Some("Editors' pick")
    }

    "should set title to 'Editors' pick' for regional editors picks topics" in {
      val editorsPicksTopicNames = BreakingNewsUpdate.EditorsPicksTopics.map(_.name)
      editorsPicksTopicNames.foreach { topicName =>
        BreakingNewsUpdate
          .createPayload(createTrail(topicName), exampleEmail)
          .title shouldBe Some("Editors' pick")
      }
    }

    "should set title to 'One not to miss' for global one-not-to-miss topic" in {
      BreakingNewsUpdate
        .createPayload(createTrail(BreakingNewsUpdate.OneNotToMissGlobalTopicName), exampleEmail)
        .title shouldBe Some("One not to miss")
    }

    "should set title to 'One not to miss' for regional one-not-to-miss topics" in {
      val oneNotToMissTopicNames = BreakingNewsUpdate.OneNotToMissTopics.map(_.name)
      oneNotToMissTopicNames.foreach { topicName =>
        BreakingNewsUpdate
          .createPayload(createTrail(topicName), exampleEmail)
          .title shouldBe Some("One not to miss")
      }
    }
  }
}
