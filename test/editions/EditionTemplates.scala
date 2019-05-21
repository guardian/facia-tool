package editions

import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class editionTemplateTest extends FreeSpec with Matchers {

  "createEdition" - {
    "should return Monday's content for Monday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-12"), DailyEdition.dailyEdition) should be
      Some(
        EditionTemplateForDate("dailyEdition",
          List(Fronts.ukNews, Fronts.sports)
        )
      )
    }

    "should return Wednesday's content for Wednesday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-13"), DailyEdition.dailyEdition) should be
      Some(
        EditionTemplateForDate("dailyEdition",
          List(Fronts.ukNews, Fronts.sports, Fronts.opinion)
        )
      )
    }

    "should return Thursday's content for Thursday" in {
      EditionTemplateHelpers.generateEditionTemplate(DateTime.parse("2019-03-14"), DailyEdition.dailyEdition) should be
      Some(
        EditionTemplateForDate("dailyEdition",
          List(Fronts.ukNews, Fronts.sports, Fronts.opinion)
        )
      )
    }
  }
}
