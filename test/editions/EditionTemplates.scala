package editions

import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class editionTemplateTest extends FreeSpec with Matchers {

  "createEdition" - {
    "should return Monday's content for Monday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-11"), DailyEdition.dailyEdition).get.fronts.length should be (2)
    }

    "should return Wednesday's content for Wednesday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-13"), DailyEdition.dailyEdition).get.fronts.length should be (3)
    }

    "should return Thursday's content for Thursday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-14"), DailyEdition.dailyEdition).get.fronts.length should be (4)
    }
  }
}
