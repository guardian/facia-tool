package editions

import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class editionTemplateTest extends FreeSpec with Matchers {

  "createEdition" - {
    "should return Monday's content for Monday" in {
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-11"), DailyEdition.template).get.fronts
      editionTemplateFronts.length should be (10)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("comment/journal", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("sport/sport", _, _, _) => }
      editionTemplateFronts(2) should matchPattern { case FrontTemplate("arts/arts", _, _, _) => }
      editionTemplateFronts(3) should matchPattern { case FrontTemplate("features/features", _, _, _) => }
      editionTemplateFronts(4) should matchPattern { case FrontTemplate("news/financial", _, _, _) => }
      editionTemplateFronts(5) should matchPattern { case FrontTemplate("news/international", _, _, _) => }
      editionTemplateFronts(6) should matchPattern { case FrontTemplate("frontpage/frontpage", _, _, _) => }
      editionTemplateFronts(7) should matchPattern { case FrontTemplate("news/national", _, _, _) => }
      editionTemplateFronts(8) should matchPattern { case FrontTemplate("media/media", _, _, _) => }
      editionTemplateFronts(9) should matchPattern { case FrontTemplate("special/special", _, _, _) => }
    }

    "should return Friday's content for Friday" in {
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-15"), DailyEdition.template).get.fronts
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
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-16"), DailyEdition.template).get.fronts
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
