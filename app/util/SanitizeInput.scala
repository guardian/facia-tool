package util

import com.gu.facia.client.models.{ConfigJson, FrontJson}

import scala.util.matching.Regex

object SanitizeInput {
  val sanitizeRegex: Regex = "(<.*?>|<[^>]*$)".r
  val hiddenPriorities = List("edition", "training")

  def fromString(s: String) = sanitizeRegex.replaceAllIn(s, "")

  def sanitizeConfig(config: ConfigJson): ConfigJson = {
    runSanitize(config, sanitizeSeoInputFromFront, ensureHiddenPriorities)
  }

  private def runSanitize(config: ConfigJson, fns: FrontJson => FrontJson*) = {
    config.copy(fronts = config.fronts.mapValues(front => fns.foldLeft(front)((f, fn) => fn(f))))
  }

  private def ensureHiddenPriorities(front: FrontJson): FrontJson = front.copy(
    isHidden = front.priority.flatMap(p =>
      Some(true).filter(_ => hiddenPriorities.contains(p)).orElse(front.isHidden)
    )
  )

  private def sanitizeSeoInputFromFront(front: FrontJson): FrontJson = front.copy(
      title = front.title.map(fromString),
      webTitle = front.webTitle.map(fromString),
      navSection = front.navSection.map(fromString),
      description = front.description.map(fromString))
}
