package com.gu.editions

import java.time.ZonedDateTime

sealed trait EditionsEvent

case class PublishEvent(edition: String, issueDate: ZonedDateTime, location: String) extends EditionsEvent

