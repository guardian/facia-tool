package model.editions.templates

import model.editions.Swatch.Neutral
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
    collection("Special").copy(prefill = prefill)
  ).special
   .swatch(swatch)
}

