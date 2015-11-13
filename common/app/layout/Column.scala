package layout

import cards.{Standard, MediaList, ListItem, CardType}
import scalaz.syntax.traverse._
import scalaz.std.option._

object ItemClasses {
  val showMore = ItemClasses(mobile = ListItem, tablet = ListItem)

  val liveBlogMore = ItemClasses(mobile = MediaList, tablet = Standard)
}

case class ItemClasses(mobile: CardType, tablet: CardType, desktop: Option[CardType] = None) {
  /** Template helper */
  def classes: String = s"fc-item--${mobile.cssClassName}-mobile fc-item--${tablet.cssClassName}-tablet" +
    desktop.map(d => s" fc-item--${d.cssClassName}-desktop").getOrElse("")

  def allTypes = Set(mobile, tablet) ++ desktop.toSet

  def showVideoPlayer = allTypes.exists(_.videoPlayer.show)
  def showVideoEndSlate = allTypes.exists(_.videoPlayer.showEndSlate)

  def showCutOut = allTypes.exists(_.showCutOut)
  def canShowSlideshow = allTypes.exists(_.canShowSlideshow)
}
case class SliceLayout(cssClassName: String, columns: Seq[Column]) {
  def numItems = columns.map(_.numItems).sum
}

object Column {
  def cardStyle(column: Column, index: Int) = column match {
    case SingleItem(_, itemClasses) => Some(itemClasses)
    case Rows(_, _, _, itemClasses) => Some(itemClasses)
    case SplitColumn(_, topItemRows, top, _, _) if topItemRows > index => Some(top)
    case SplitColumn(_, _, _, _, bottom) => Some(bottom)
    case _ => None
  }
}

sealed trait Column {
  def numItems: Int
  def colSpan: Int
}

case class SingleItem(colSpan: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = 1
}
case class Rows(colSpan: Int, columns: Int, rows: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = columns * rows
}
case class SplitColumn(colSpan: Int, topItemRows: Int, topItemClasses: ItemClasses, bottomItemRows: Int, bottomItemsClasses: ItemClasses) extends Column {
  val numItems: Int = topItemRows + bottomItemRows
}
case class MPU(colSpan: Int) extends Column {
  val numItems: Int = 0
}
