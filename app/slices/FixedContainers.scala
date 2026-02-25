package slices

import conf.ApplicationConfiguration

class FixedContainers(val config: ApplicationConfiguration) {
  import ContainerDefinition.{ofSlices => slices}

  val showcase = slices(ShowcaseSingleStories)
  val thrasher =
    slices(Fluid).copy(customCssClasses = Set("fc-container--thrasher"))
	val staticFeature2 = slices(StaticFeature)
  val staticMedium4 = slices(QuarterQuarterQuarterQuarter)

  val all: Map[String, ContainerDefinition] = Map(
    ("thrasher", thrasher),
    ("fixed/showcase", showcase),
    ("static/medium/4", staticMedium4),
    ("static/feature/2", staticFeature2)
  ) ++ (if (config.faciatool.showTestContainers)
          Map(
            (
              "all-items/not-for-production",
              slices(
                FullMedia100,
                FullMedia75,
                FullMedia50,
                HalfHalf,
                QuarterThreeQuarter,
                ThreeQuarterQuarter,
                Hl4Half,
                HalfQuarterQl2Ql4,
                TTTL4,
                Ql3Ql3Ql3Ql3
              )
            )
          )
        else Map.empty)

  def unapply(collectionType: Option[String]): Option[ContainerDefinition] =
    collectionType.flatMap(all.lift)
}
