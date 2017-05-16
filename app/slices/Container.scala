package slices

import com.gu.facia.api.models.CollectionConfig
import play.api.Logger

class Containers(val fixedContainers: FixedContainers) {
  /** This is THE top level resolver for containers */
  val all: Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("dynamic/package", Dynamic(DynamicPackage)),
    ("dynamic/election", Dynamic(DynamicElection)),
    ("dynamic/slow-mpu", Dynamic(DynamicSlowMPU)),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular)
  ) ++ fixedContainers.all.mapValues(Fixed.apply)

  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(fixedContainers.fixedSmallSlowIV)

  def resolve(id: String) = all.getOrElse(id, {
    Logger.error(s"Could not resolve container id $id, using default container")
    default
  })

  def fromConfig(collectionConfig: CollectionConfig) =
    resolve(collectionConfig.collectionType)
}

sealed trait Container

case class Dynamic(get: DynamicContainer) extends Container
case class Fixed(get: ContainerDefinition) extends Container
case object NavList extends Container
case object NavMediaList extends Container
case object MostPopular extends Container
