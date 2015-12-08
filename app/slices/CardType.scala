package cards

sealed trait CardType {
  val cssClassName: String

  case class VideoPlayerMode(show: Boolean, showEndSlate: Boolean)

}

/** This is called ListItem because List is already taken */
case object ListItem extends CardType {
  override val cssClassName = "list"
}

case object MediaList extends CardType {
  override val cssClassName = "list-media"
}

case object Standard extends CardType {
  override val cssClassName = "standard"
}

case object Half extends CardType {
  override val cssClassName = "half"
}

case object ThreeQuarters extends CardType {
  override val cssClassName: String = "three-quarters"
}

case object ThreeQuartersRight extends CardType {
  override val cssClassName: String = "three-quarters-right"
}

case object ThreeQuartersTall extends CardType {
  override val cssClassName: String = "three-quarters-tall"
}

case object FullMedia50 extends CardType {
  override val cssClassName: String = "full-media-50"
}

case object FullMedia75 extends CardType {
  override val cssClassName: String = "full-media-75"
}

case object FullMedia100 extends CardType {
  override val cssClassName: String = "full-media-100"
}

case object Fluid extends CardType {
  override val cssClassName: String = "fluid"
}

case object Third extends CardType {
  override val cssClassName: String = "third"
}

case object SavedForLater extends CardType {
  override val cssClassName: String = "saved-for-later"
}
