package editions

import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class editionTemplateTest extends FreeSpec with Matchers {

  "createEdition" - {
    "should return Monday's content for Monday" in {
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-11"), DailyEdition.dailyEdition).get.fronts
      println(editionTemplateFronts(1))
      editionTemplateFronts.length should be (2)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("UK news", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("Sport", _, _, _) => }
    }

    "should return Wednesday's content for Wednesday" in {
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-13"), DailyEdition.dailyEdition).get.fronts
      editionTemplateFronts.length should be (3)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("UK news", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("Sport", _, _, _) => }
      editionTemplateFronts(2) should matchPattern { case FrontTemplate("Opinion", _, _, _) => }
    }

    "should return Thursday's content for Thursday" in {
      val editionTemplateFronts = EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-14"), DailyEdition.dailyEdition).get.fronts
      editionTemplateFronts.length should be (4)
      editionTemplateFronts(0) should matchPattern { case FrontTemplate("UK news", _, _, _) => }
      editionTemplateFronts(2) should matchPattern { case FrontTemplate("Opinion", _, _, _) => }
      editionTemplateFronts(1) should matchPattern { case FrontTemplate("Sport", _, _, _) => }
      editionTemplateFronts(3) should matchPattern { case FrontTemplate("Technology", _, _, _) => }
    }
  }
}
