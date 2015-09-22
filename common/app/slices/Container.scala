package slices

import com.gu.facia.api.models.CollectionConfig
import common.Logging
import model.facia.PressedCollection

object Container extends Logging {
  /** This is THE top level resolver for containers */
  val all: Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("dynamic/package", Dynamic(DynamicPackage)),
    ("dynamic/slow-mpu", Dynamic(DynamicSlowMPU)),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular)
  ) ++ FixedContainers.all.mapValues(Fixed.apply)

  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(FixedContainers.fixedSmallSlowIV)

  def resolve(id: String) = all.getOrElse(id, {
    log.error(s"Could not resolve container id $id, using default container")
    default
  })

  def fromConfig(collectionConfig: CollectionConfig) =
    resolve(collectionConfig.collectionType)

  def fromPressedCollection(pressedCollection: PressedCollection): Container =
    resolve(pressedCollection.collectionType)

  def showToggle(container: Container) = container match {
    case NavList | NavMediaList => false
    case _ => true
  }

  def customClasses(container: Container) = container match {
    case Dynamic(DynamicPackage) => Set("fc-container--story-package")
    case Fixed(fixedContainer) => fixedContainer.customCssClasses
    case _ => Nil
  }
}

sealed trait Container

case class Dynamic(get: DynamicContainer) extends Container
case class Fixed(get: ContainerDefinition) extends Container
case object NavList extends Container
case object NavMediaList extends Container
case object MostPopular extends Container
