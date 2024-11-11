package model.editions

import org.postgresql.util.PGobject
import play.api.libs.json.Json
import services.editions.prefills.CapiQueryTimeWindow

import java.time.{LocalDate, ZoneId}

// Issue skeletons are what is generated when you create a new issue for a given date
// (Date + Template) => Skeleton
case class EditionsIssueSkeleton(
    issueDate: LocalDate,
    zoneId: ZoneId,
    fronts: List[EditionsFrontSkeleton]
)

case class EditionsFrontSkeleton(
    name: String,
    collections: List[EditionsCollectionSkeleton],
    presentation: FrontPresentation,
    hidden: Boolean,
    isSpecial: Boolean
) {
  def metadata() = {
    val metadataParam = new PGobject()
    metadataParam.setType("jsonb")
    metadataParam.setValue(
      Json
        .toJson(EditionsFrontMetadata(None, Some(presentation.swatch)))
        .toString
    )
    metadataParam
  }
}

case class EditionsCollectionSkeleton(
    name: String,
    items: List[EditionsCardSkeleton],
    prefill: Option[CapiPrefillQuery],
    capiQueryTimeWindow: CapiQueryTimeWindow,
    hidden: Boolean
)

case class EditionsCardSkeleton(
    id: String,
    cardType: CardType,
    metadata: Option[EditionsCardMetadata] = None
)
