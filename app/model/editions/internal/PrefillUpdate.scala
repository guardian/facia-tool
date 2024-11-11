package model.editions.internal

import java.time.{LocalDate, ZoneId}

import model.editions.{CapiPrefillQuery, Edition}
import services.editions.prefills.CapiQueryTimeWindow

// Small class which is returned by the database to allow fetching new prefilled articles
case class PrefillUpdate(
    issueDate: LocalDate,
    edition: Edition,
    zone: ZoneId,
    capiPrefillQuery: CapiPrefillQuery,
    capiQueryTimeWindow: CapiQueryTimeWindow,
    currentPageCodes: List[String]
)
