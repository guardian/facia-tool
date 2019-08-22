package model.editions.internal

import java.time.{LocalDate, ZoneId}

import model.editions.CapiPrefillQuery

// Small class which is returned by the database to allow fetching new prefilled articles
case class PrefillUpdate(issueDate: LocalDate, zone: ZoneId, prefill: CapiPrefillQuery, currentPageCodes: List[String])

