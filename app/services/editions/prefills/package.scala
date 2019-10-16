package services.editions

import java.time.{Instant, LocalDate}

import com.gu.facia.api.utils.ResolvedMetaData
import model.editions.{CapiPrefillQuery, Edition, Image, MediaType}

package object prefills {

  case class Prefill(
                      internalPageCode: Int,
                      newspaperPageNumber: Option[Int],
                      webUrl: String,
                      metaData: ResolvedMetaData,
                      cutout: Option[Image],
                      tone: String,
                      mediaType: Option[MediaType],
                      pickedKicker: Option[String] // Note: algorithmically-picked, not human-picked.
                    )

  case class CapiQueryTimeWindow(fromDate: Instant, toDate: Instant)

  case class PrefillParamsAdapter(
                                  issueDate: LocalDate,
                                  capiPrefillQuery: CapiPrefillQuery,
                                  maybeOphanUrl: Option[String],
                                  range: Long,
                                  edition: Edition
                                 )

}
