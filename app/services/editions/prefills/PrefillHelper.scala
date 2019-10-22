package services.editions.prefills

import java.net.URI
import java.nio.charset.Charset
import java.time.{LocalDate, ZoneOffset}

import model.editions.TimeWindowConfigInDays
import org.apache.http.client.utils.URLEncodedUtils
import services.CapiQueryGenerator

import scala.collection.JavaConverters._

object PrefillHelper {

  def defineContentQueryTimeWindow(issueDate: LocalDate, timeWindowConfig: TimeWindowConfigInDays): CapiQueryTimeWindow = {
    val issueDateStart = issueDate.atStartOfDay()
    // Regarding UTC Hack because composer/capi/whoever doesn't worry about timezones in the newspaper-edition date
    val fromDateUTC = issueDateStart.plusDays(timeWindowConfig.startOffset).toInstant(ZoneOffset.UTC)
    val toDateAsUTC = issueDateStart.plusDays(timeWindowConfig.endOffset).toInstant(ZoneOffset.UTC)
    CapiQueryTimeWindow(fromDateUTC, toDateAsUTC)
  }

  def geneneratePrefillQuery(getPrefillParams: PrefillParamsAdapter, fields: List[String]): CapiQueryGenerator = {

    import getPrefillParams._

    val params = URLEncodedUtils
      .parse(new URI(contentPrefillUrlSegments.escapedQueryString()), Charset.forName("UTF-8"))
      .asScala

    import contentPrefillTimeWindow.{fromDate, toDate}

    var query = CapiQueryGenerator(contentPrefillUrlSegments.pathType)
      .page(1)
      .pageSize(200)
      .showFields(fields.mkString(","))
      .useDate("newspaper-edition") // deliberately-kebab-case
      .orderBy("newest")
      .fromDate(fromDate)
      .toDate(toDate)

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
