package slices

import play.api.libs.json.{Json, OFormat}
import util.Maps._

object Story {
  implicit val jsonFormat: OFormat[Story] = Json.format[Story]

  implicit val ordering: Ordering[Story] = Ordering.by[Story, Int](_.group)

  def unboosted(n: Int) = Story(n, isBoosted = false)

  private[slices] def segmentByGroup(
      stories: Seq[Story]
  ): Map[Int, Seq[Story]] = {
    stories.foldLeft(Map.empty[Int, Seq[Story]]) { (acc, story) =>
      insertWith(acc, story.group, Seq(story)) { (a, b) =>
        b ++ a
      }
    }
  }
}

case class Story(
    group: Int,
    isBoosted: Boolean
)
