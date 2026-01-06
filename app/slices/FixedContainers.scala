package slices

import conf.ApplicationConfiguration

class FixedContainers(val config: ApplicationConfiguration) {
  import ContainerDefinition.{ofSlices => slices}

  // TODO: Temporary vals for content until we refactor
  val fixedSmallSlowIV = slices(QuarterQuarterQuarterQuarter)
  val fixedMediumSlowVI =
    slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter)
  val fixedMediumSlowVII = slices(HalfQQ, QuarterQuarterQuarterQuarter)
  val fixedMediumSlowXIIMpu = slices(TTT, TlTlMpu)
  val fixedMediumFastXI = slices(HalfQQ, Ql2Ql2Ql2Ql2)
  val fixedMediumFastXII = slices(QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)
  val showcase = slices(ShowcaseSingleStories)
  val thrasher =
    slices(Fluid).copy(customCssClasses = Set("fc-container--thrasher"))

  // Static containers are very similar to fixed containers
  val staticFeature2 = slices(StaticFeature)
  val staticMedium4 = slices(QuarterQuarterQuarterQuarter)

  val all: Map[String, ContainerDefinition] = Map(
    ("fixed/small/slow-I", slices(FullMedia75)),
    ("fixed/small/slow-III", slices(HalfQQ)),
    ("fixed/small/slow-IV", fixedSmallSlowIV),
    ("fixed/small/slow-V-half", slices(Hl4Half)),
    ("fixed/small/slow-V-third", slices(QuarterQuarterHl3)),
    ("fixed/small/slow-V-mpu", slices(TTlMpu)),
    ("fixed/small/fast-VIII", slices(QuarterQuarterQlQl)),
    ("fixed/medium/slow-VI", fixedMediumSlowVI),
    ("fixed/medium/slow-VII", fixedMediumSlowVII),
    ("fixed/medium/slow-XII-mpu", fixedMediumSlowXIIMpu),
    ("fixed/medium/fast-XI", fixedMediumFastXI),
    ("fixed/medium/fast-XII", fixedMediumFastXII),
    (
      "fixed/large/slow-XIV",
      slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)
    ),
    ("fixed/thrasher", thrasher),
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
