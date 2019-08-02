package services

import java.time.{LocalDate, ZonedDateTime}

import com.gu.contentapi.client.model.v1.SearchResponse
import fixtures.TestEdition
import org.scalatest.{FreeSpec, Matchers}
import model.editions._
import services.editions.EditionsTemplating

import scala.concurrent.Future

class editionTemplateTest extends FreeSpec with Matchers {

  // Currently not testing prefills!
  object TestCapi extends Capi {
    override def getPreviewHeaders(url: String): Seq[(String, String)] = Seq.empty[(String, String)]
    override def getPrefillArticles(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery, currentPageCodes: List[String]): Future[SearchResponse] = Future.successful(null)
    override def getPrefillArticleItems(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[(String, PrefillMetadata)]] = Future.successful(Nil)
  }
  val templating = new EditionsTemplating(TestEdition.templates, TestCapi)

//  "createEdition" - {
//    "should return Monday's content for Monday" in {
//      val editionTemplateFronts = templating.generateEditionTemplate("daily-edition", LocalDate.parse("2019-03-11")).get.fronts
//      editionTemplateFronts.length should be (10)
//      editionTemplateFronts(0) should matchPattern { case EditionsFrontSkeleton("comment/journal", _,  _, _) => }
//      editionTemplateFronts(1) should matchPattern { case EditionsFrontSkeleton("sport/sport", _, _, _) => }
//      editionTemplateFronts(2) should matchPattern { case EditionsFrontSkeleton("arts/arts", _, _, _) => }
//      editionTemplateFronts(3) should matchPattern { case EditionsFrontSkeleton("features/features", _, _, _) => }
//      editionTemplateFronts(4) should matchPattern { case EditionsFrontSkeleton("news/financial", _, _, _) => }
//      editionTemplateFronts(5) should matchPattern { case EditionsFrontSkeleton("news/international", _, _, _) => }
//      editionTemplateFronts(6) should matchPattern { case EditionsFrontSkeleton("frontpage/frontpage", _, _, _) => }
//      editionTemplateFronts(7) should matchPattern { case EditionsFrontSkeleton("news/national", _, _, _) => }
//      editionTemplateFronts(8) should matchPattern { case EditionsFrontSkeleton("media/media", _, _, _) => }
//      editionTemplateFronts(9) should matchPattern { case EditionsFrontSkeleton("special/special", _, _, _) => }
//    }
//
//    "should return Friday's content for Friday" in {
//      val editionTemplateFronts = templating.generateEditionTemplate("daily-edition", LocalDate.parse("2019-03-15")).get.fronts
//      editionTemplateFronts.length should be (10)
//      editionTemplateFronts(0) should matchPattern { case EditionsFrontSkeleton("comment/journal", _, _, _) => }
//      editionTemplateFronts(1) should matchPattern { case EditionsFrontSkeleton("sport/sport", _, _, _) => }
//      editionTemplateFronts(2) should matchPattern { case EditionsFrontSkeleton("arts/artsfriday", _, _, _) => }
//      editionTemplateFronts(3) should matchPattern { case EditionsFrontSkeleton("film/film", _, _, _) => }
//      editionTemplateFronts(4) should matchPattern { case EditionsFrontSkeleton("music/music", _, _, _) => }
//      editionTemplateFronts(5) should matchPattern { case EditionsFrontSkeleton("news/financial", _, _, _) => }
//      editionTemplateFronts(6) should matchPattern { case EditionsFrontSkeleton("news/international", _, _, _) => }
//      editionTemplateFronts(7) should matchPattern { case EditionsFrontSkeleton("frontpage/frontpage", _, _, _) => }
//      editionTemplateFronts(8) should matchPattern { case EditionsFrontSkeleton("news/national", _, _, _) => }
//      editionTemplateFronts(9) should matchPattern { case EditionsFrontSkeleton("special/special", _, _, _) => }
//    }
//
//    "should return Saturday's content for Saturday" in {
//      val editionTemplateFronts = templating.generateEditionTemplate("daily-edition", LocalDate.parse("2019-03-16")).get.fronts
//      editionTemplateFronts.length should be (13)
//      editionTemplateFronts(0) should matchPattern { case EditionsFrontSkeleton("comment/journal", _, _, _) => }
//      editionTemplateFronts(1) should matchPattern { case EditionsFrontSkeleton("weekend/weekend", _, _, _) => }
//      editionTemplateFronts(2) should matchPattern { case EditionsFrontSkeleton("theguide/theguide", _, _, _) => }
//      editionTemplateFronts(3) should matchPattern { case EditionsFrontSkeleton("sport/sport", _, _, _) => }
//      editionTemplateFronts(4) should matchPattern { case EditionsFrontSkeleton("travel/travel", _, _, _) => }
//      editionTemplateFronts(5) should matchPattern { case EditionsFrontSkeleton("news/financial", _, _, _) => }
//      editionTemplateFronts(6) should matchPattern { case EditionsFrontSkeleton("news/international", _, _, _) => }
//      editionTemplateFronts(7) should matchPattern { case EditionsFrontSkeleton("frontpage/frontpage", _, _, _) => }
//      editionTemplateFronts(8) should matchPattern { case EditionsFrontSkeleton("news/national", _, _, _) => }
//      editionTemplateFronts(9) should matchPattern { case EditionsFrontSkeleton("money/money", _, _, _) => }
//      editionTemplateFronts(10) should matchPattern { case EditionsFrontSkeleton("review/review", _, _, _) => }
//      editionTemplateFronts(11) should matchPattern { case EditionsFrontSkeleton("feast/feast", _, _, _) => }
//      editionTemplateFronts(12) should matchPattern { case EditionsFrontSkeleton("special/special", _, _, _) => }
//    }
//  }
}
