package slices

trait ScrollableContainer {
  def storiesVisible(stories: Seq[Story]): Int
}

object ScrollableHighlights extends ScrollableContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    stories.size min 6
  }
}

object ScrollableSmall extends ScrollableContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    stories.size min 4
  }
}

object ScrollableMedium extends ScrollableContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    stories.size min 4
  }
}

object ScrollableFeature extends ScrollableContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    stories.size min 3
  }
}
