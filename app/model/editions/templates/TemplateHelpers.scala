package model.editions.templates

import model.editions.{CapiPrefillQuery, CollectionPresentation, CollectionTemplate, FrontPresentation, FrontTemplate, Swatch}

object TemplateHelpers {
  object Defaults {
    val defaultFrontPresentation = FrontPresentation(model.editions.Swatch.Neutral)
    val defaultCollectionPresentation = CollectionPresentation()
  }

  def collection(name: String): CollectionTemplate =
    CollectionTemplate(name, None, Defaults.defaultCollectionPresentation, hidden = false)

  def front(name: String, collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(name, collections.toList, Defaults.defaultFrontPresentation)

  def specialFront(name: String, swatch: Swatch, prefill: Option[CapiPrefillQuery] = None) = front(
    name,
    collection("Special Container 1").special.copy(prefill = prefill),
    collection("Special Container 2").special,
    collection("Special Container 3").special
  ).special
   .swatch(swatch)
}

