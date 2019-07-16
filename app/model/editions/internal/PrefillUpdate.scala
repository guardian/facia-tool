package model.editions.internal

import java.time.ZonedDateTime

import model.editions.CapiPrefillQuery

// Small class which is returned by the database to allow fetching new prefilled articles
case class PrefillUpdate(issueDate: ZonedDateTime, prefill: CapiPrefillQuery, currentPageCodes: List[String])

