package slices

import cards._

object ItemClasses {}
case class ItemClasses(
    mobile: CardType,
    tablet: CardType,
    desktop: Option[CardType] = None
) {}

case class SliceLayout(cssClassName: String, columns: Seq[Column]) {
  def numItems = columns.map(_.numItems).sum
}

object Column {
  def cardStyle(column: Column, index: Int) = column match {
    case SingleItem(_, itemClasses) => Some(itemClasses)
    case Rows(_, _, _, itemClasses) => Some(itemClasses)
    case SplitColumn(_, topItemRows, top, _, _) if topItemRows > index =>
      Some(top)
    case SplitColumn(_, _, _, _, bottom) => Some(bottom)
    case _                               => None
  }
}

sealed trait Column {
  def numItems: Int
  def colSpan: Int
}

case class SingleItem(colSpan: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = 1
}
case class Rows(colSpan: Int, columns: Int, rows: Int, itemClasses: ItemClasses)
    extends Column {
  val numItems: Int = columns * rows
}
case class SplitColumn(
    colSpan: Int,
    topItemRows: Int,
    topItemClasses: ItemClasses,
    bottomItemRows: Int,
    bottomItemsClasses: ItemClasses
) extends Column {
  val numItems: Int = topItemRows + bottomItemRows
}
case class MPU(colSpan: Int) extends Column {
  val numItems: Int = 0
}
