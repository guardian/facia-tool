package model.editions.templates

import model.editions.{CapiPrefillQuery, CapiTimeWindowConfigInDays, CollectionPresentation, CollectionTemplate, FrontPresentation, FrontTemplate, Swatch}

object TemplateHelpers {
  object Defaults {
    val defaultFrontPresentation = FrontPresentation(model.editions.Swatch.Neutral)
    val defaultCollectionPresentation = CollectionPresentation()
    val defaultCollectionArticleItemsCap: Int = 200
  }

  def collection(name: String): CollectionTemplate = {
    CollectionTemplate(
      name,
      maybeOphanPath = None,
      prefill = None,
      presentation = Defaults.defaultCollectionPresentation,
      hidden = false
    )
  }

  def front(name: String, ophanPath: Option[String], collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(name, collections.toList, Defaults.defaultFrontPresentation, ophanPath)

  def front(name: String, collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(name, collections.toList, Defaults.defaultFrontPresentation, None)

  def specialFront(name: String, swatch: Swatch, ophanPath: Option[String] = None, prefill: Option[CapiPrefillQuery] = None) = front(
    name,
    ophanPath,
    collection("Special Container 1").hide.copy(prefill = prefill),
    collection("Special Container 2").hide,
    collection("Special Container 3").hide
  ).special
    .swatch(swatch)

}

