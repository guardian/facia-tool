package slices

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore

object ContainerDefinition {
  val DefaultCards = 6

  def ofSlices(slices: Slice*) = ContainerDefinition(
    slices,
    RestrictTo(6),
    Set.empty
  )
}

case class ContainerDefinition(
    slices: Seq[Slice],
    mobileShowMore: MobileShowMore,
    customCssClasses: Set[String]
) {
  def numItems = slices.map(_.layout.numItems).sum
}
