package services.editions.prefills

import java.net.URI
import java.nio.charset.Charset
import java.time.{LocalDate, ZoneOffset}

import model.editions.{Edition, EditionTemplate, TimeWindowConfigInDays}
import org.apache.http.client.utils.URLEncodedUtils
import services.CapiQueryGenerator

import scala.collection.JavaConverters._

class PrefillHelper(val templates: Map[Edition, EditionTemplate]) {

  import PrefillHelper._

  def geneneratePrefillQuery(prefillParams: PrefillParamsAdapter, fields: List[String]): CapiQueryGenerator = {

    import prefillParams._

    val params = URLEncodedUtils
      .parse(new URI(capiPrefillQuery.escapedQueryString()), Charset.forName("UTF-8"))
      .asScala

    val timeWindowCfg = templates(edition).capiQueryPrefillParams.timeWindowConfig

    val timeWindow = defineTimeWindow(issueDate, timeWindowCfg)

    var query = CapiQueryGenerator(capiPrefillQuery.pathType)
      .page(1)
      .pageSize(200)
      .showFields(fields.mkString(","))
      .useDate("newspaper-edition") // deliberately-kebab-case
      .orderBy("newest")
      .fromDate(timeWindow.fromDate)
      .toDate(timeWindow.toDate)

    params.filter(pair => pair.getName == "section").foreach { sectionPair =>
      query = query.section(sectionPair.getValue)
    }

    params.filter(pair => pair.getName == "tag").foreach { tagPair =>
      query = query.tag(tagPair.getValue)
    }

    params.find(pair => pair.getName == "q").foreach { queryPair =>
      query = query.q(queryPair.getValue)
    }

    query
  }

}

object PrefillHelper {

  def apply(templates: Map[Edition, EditionTemplate]): PrefillHelper = new PrefillHelper(templates)

  private[prefills] def defineTimeWindow(issueDate: LocalDate, timeWindowConfig: TimeWindowConfigInDays): CapiQueryTimeWindow = {
    val issueDateStart = issueDate.atStartOfDay()
    // Regarding UTC Hack because composer/capi/whoever doesn't worry about timezones in the newspaper-edition date
    val fromDateUTC = issueDateStart.plusDays(timeWindowConfig.startDiff).toInstant(ZoneOffset.UTC)
    val toDateAsUTC = issueDateStart.plusDays(timeWindowConfig.endDiff).toInstant(ZoneOffset.UTC)
    CapiQueryTimeWindow(fromDateUTC, toDateAsUTC)
  }

}
