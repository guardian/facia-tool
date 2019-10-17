package services.editions.prefills

import java.time.{LocalDate, ZoneOffset}

import fixtures.TestEdition
import model.editions.{CapiPrefillQuery, Edition, PathType, TimeWindowConfigInDays}
import org.scalatest.{FunSuite, Matchers}

class PrefillHelperTest extends FunSuite with Matchers {

  private val issueDate = LocalDate.of(2019, 10, 5)

  private def prefillHelper = PrefillHelper(TestEdition.templates)

  test("defineTimeWindow should return expected time window") {
    val timeWindowCfg = TimeWindowConfigInDays(startOffset = -1, endOffset = 2)
    PrefillHelper.defineTimeWindow(issueDate, timeWindowCfg) shouldEqual CapiQueryTimeWindow(
      LocalDate.of(2019, 10, 4).atStartOfDay().toInstant(ZoneOffset.UTC),
      LocalDate.of(2019, 10, 7).atStartOfDay().toInstant(ZoneOffset.UTC)
    )
  }

  test("geneneratePrefillQuery") {

    val prefillQuery = CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)

    val prefillParams = PrefillParamsAdapter(issueDate, prefillQuery, None, None, Edition.TrainingEdition)

    val fields = List(
      "newspaperEditionDate",
      "newspaperPageNumber",
      "internalPageCode"
    )

    val actual = prefillHelper.geneneratePrefillQuery(prefillParams, fields).getUrl("")

    val expected = "/content/print-sent?order-by=newest&page-size=200&tag=theguardian%2Fmainsection%2Ftopstories&to-date=2019-10-07T00%3A00%3A00Z&page=1&use-date=newspaper-edition&show-fields=newspaperEditionDate%2CnewspaperPageNumber%2CinternalPageCode&from-date=2019-10-04T00%3A00%3A00Z"

    actual shouldEqual expected
  }

}
