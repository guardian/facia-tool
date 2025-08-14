package slices

import com.gu.facia.api.models.CollectionConfig
import logging.Logging

class Containers(val fixedContainers: FixedContainers) extends Logging {

  /** This is THE top level resolver for containers */
  val all: Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("dynamic/package", Dynamic(DynamicPackage)),
    ("flexible/general", Flexible(FlexibleGeneral)),
    ("flexible/special", Flexible(FlexibleSpecial)),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular),
    ("scrollable/highlights", Scrollable(ScrollableHighlights)),
    ("scrollable/small", Scrollable(ScrollableSmall)),
    ("scrollable/medium", Scrollable(ScrollableMedium)),
    ("scrollable/feature", Scrollable(ScrollableFeature))
  ) ++ fixedContainers.all.view.mapValues(Fixed.apply)

  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(fixedContainers.fixedSmallSlowIV)

  def resolve(id: String) = all.getOrElse(
    id, {
      logger.error(
        s"Could not resolve container id $id, using default container"
      )
      default
    }
  )

  def fromConfig(collectionConfig: CollectionConfig) =
    resolve(collectionConfig.collectionType)
}

sealed trait Container

case class Dynamic(get: DynamicContainer) extends Container
case class Flexible(get: FlexibleContainer) extends Container
case class Fixed(get: ContainerDefinition) extends Container
case class Scrollable(get: ScrollableContainer) extends Container
case object NavList extends Container
case object NavMediaList extends Container
case object MostPopular extends Container
