package services

import java.time.{LocalDate, ZonedDateTime}

import org.scalatest.{FreeSpec, Matchers}
import model.editions._
import services.editions.EditionsTemplating

import scala.concurrent.Future

class editionTemplateTest extends FreeSpec with Matchers {

  // Currently not testing prefills!
  object TestCapi extends Capi {
    override def getPreviewHeaders(url: String): Seq[(String, String)] = Seq.empty[(String, String)]

    override def getPrefillArticlePageCodes(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[String]] = Future.successful(Nil)
  }
  val templating = new EditionsTemplating(TestCapi)

  "createEdition" - {
    "should return Monday's content for Monday" in {
      val editionTemplateFronts = templating.generateEditionTemplate("dailyEdition", LocalDate.parse("2019-03-11")).get.fronts
      editionTemplateFronts.length should be (10)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("comment/journal", _, _, _) => }
      //editionTemplateFronts(1) should matchPattern { case FrontTemplate("sport/sport", _, _, _) => }
      //editionTemplateFronts(2) should matchPattern { case FrontTemplate("arts/arts", _, _, _) => }
      //editionTemplateFronts(3) should matchPattern { case FrontTemplate("features/features", _, _, _) => }
      //editionTemplateFronts(4) should matchPattern { case FrontTemplate("news/financial", _, _, _) => }
      //editionTemplateFronts(5) should matchPattern { case FrontTemplate("news/international", _, _, _) => }
      //editionTemplateFronts(6) should matchPattern { case FrontTemplate("frontpage/frontpage", _, _, _) => }
      //editionTemplateFronts(7) should matchPattern { case FrontTemplate("news/national", _, _, _) => }
      //editionTemplateFronts(8) should matchPattern { case FrontTemplate("media/media", _, _, _) => }
      //editionTemplateFronts(9) should matchPattern { case FrontTemplate("special/special", _, _, _) => }
    }

    "should return Friday's content for Friday" in {
      val editionTemplateFronts = templating.generateEditionTemplate("dailyEdition", LocalDate.parse("2019-03-15")).get.fronts
      editionTemplateFronts.length should be (10)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("comment/journal", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("sport/sport", _, _, _) => }
      editionTemplateFronts(2) should matchPattern { case FrontTemplate("arts/artsfriday", _, _, _) => }
      editionTemplateFronts(3) should matchPattern { case FrontTemplate("film/film", _, _, _) => }
      editionTemplateFronts(4) should matchPattern { case FrontTemplate("music/music", _, _, _) => }
      editionTemplateFronts(5) should matchPattern { case FrontTemplate("news/financial", _, _, _) => }
      editionTemplateFronts(6) should matchPattern { case FrontTemplate("news/international", _, _, _) => }
      editionTemplateFronts(7) should matchPattern { case FrontTemplate("frontpage/frontpage", _, _, _) => }
      editionTemplateFronts(8) should matchPattern { case FrontTemplate("news/national", _, _, _) => }
      editionTemplateFronts(9) should matchPattern { case FrontTemplate("special/special", _, _, _) => }
    }

    "should return Saturday's content for Saturday" in {
      val editionTemplateFronts = templating.generateEditionTemplate("dailyEdition", LocalDate.parse("2019-03-16")).get.fronts
      editionTemplateFronts.length should be (13)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("comment/journal", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("weekend/weekend", _, _, _) => }
      editionTemplateFronts(2) should matchPattern { case FrontTemplate("theguide/theguide", _, _, _) => }
      editionTemplateFronts(3) should matchPattern { case FrontTemplate("sport/sport", _, _, _) => }
      editionTemplateFronts(4) should matchPattern { case FrontTemplate("travel/travel", _, _, _) => }
      editionTemplateFronts(5) should matchPattern { case FrontTemplate("news/financial", _, _, _) => }
      editionTemplateFronts(6) should matchPattern { case FrontTemplate("news/international", _, _, _) => }
      editionTemplateFronts(7) should matchPattern { case FrontTemplate("frontpage/frontpage", _, _, _) => }
      editionTemplateFronts(8) should matchPattern { case FrontTemplate("news/national", _, _, _) => }
      editionTemplateFronts(9) should matchPattern { case FrontTemplate("money/money", _, _, _) => }
      editionTemplateFronts(10) should matchPattern { case FrontTemplate("review/review", _, _, _) => }
      editionTemplateFronts(11) should matchPattern { case FrontTemplate("feast/feast", _, _, _) => }
      editionTemplateFronts(12) should matchPattern { case FrontTemplate("special/special", _, _, _) => }
    }
  }
}
