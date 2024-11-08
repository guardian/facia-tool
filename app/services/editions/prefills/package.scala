package services.editions

import java.time.{Instant, LocalDate}
import com.gu.facia.api.utils.ResolvedMetaData
import model.editions._
import play.api.libs.json.{Json, OFormat}

package object prefills {

  case class Prefill(
      internalPageCode: Int,
      newspaperPageNumber: Option[Int],
      webUrl: String,
      metaData: ResolvedMetaData,
      cutout: Option[Image],
      tone: String,
      mediaType: Option[MediaType],
      pickedKicker: Option[
        String
      ], // Note: algorithmically-picked, not human-picked.
      promotionMetric: Option[Double],
      capiId: String
  )

  case class CapiQueryTimeWindow(fromDate: Instant, toDate: Instant)

  object CapiQueryTimeWindow {
    implicit def format: OFormat[CapiQueryTimeWindow] =
      Json.format[CapiQueryTimeWindow]
  }

  case class MetadataForLogging(
      issueDate: LocalDate,
      collectionId: Option[String],
      collectionName: Option[String]
  ) {
    override def toString: String = {
      val dateLog = s"issueDate=$issueDate"
      val collectionIdLog =
        if (collectionId.isDefined) s", collectionId=${collectionId.get}"
        else ""
      val collectionNameLog =
        if (collectionName.isDefined) s", collectionId=${collectionName.get}"
        else ""
      s"[$dateLog$collectionIdLog$collectionNameLog]"
    }
  }

  case class CapiPrefillTimeParams(
      capiQueryTimeWindow: CapiQueryTimeWindow,
      capiDateQueryParam: CapiDateQueryParam
  )

  case class PrefillParamsAdapter(
      issueDate: LocalDate,
      capiPrefillQuery: CapiPrefillQuery,
      capiPrefillTimeParams: CapiPrefillTimeParams,
      maybeOphanPath: Option[String],
      maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams],
      edition: Edition,
      maybePrefillItemsCap: Option[Int] = None,
      metadataForLogging: MetadataForLogging
  )

}
