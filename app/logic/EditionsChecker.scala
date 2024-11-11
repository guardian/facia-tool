package logic

import model.editions.{EditionsCollection, EditionsFront, EditionsIssue}

object EditionsChecker {

  /*
   * Checks in order of precedence, as provided by Katy
   *
   * Empty containers that are unhidden
   * Container with content that are hidden
   * Unhidden special fronts with no content
   * Hidden fronts with content
   *
   */
  def checkIssue(issue: EditionsIssue): List[String] =
    if (issue.fronts.isEmpty)
      List(
        s"Issue is empty"
      ) // This is actually almost impossible because the templates don't let you!
    else if (issue.fronts.forall(_.isHidden))
      List(s"Issue contains no visible fronts")
    else
      checkFronts(issue.fronts)

  private def checkFronts(fronts: List[EditionsFront]): List[String] = {
    (
      checkFrontsCollections(fronts)
        :::
          visibleEmptyFronts(fronts)
          :::
          invisibleNonEmptyFronts(fronts)
          :::
          visibleDefaultNameFronts(fronts)
    )
  }

  private def checkFrontsCollections(fronts: List[EditionsFront]) = {
    fronts.flatMap(front => {
      if (!front.isHidden)
        checkCollections(front, front.collections)
      else
        List()
    })
  }

  private def visibleEmptyFronts(fronts: List[EditionsFront]) =
    fronts.collect {
      case front
          if (!front.isHidden && front.collections
            .flatMap(c => c.items)
            .isEmpty) =>
        s"Front '${front.displayName}' is visible and empty"
    }

  private def invisibleNonEmptyFronts(fronts: List[EditionsFront]) =
    fronts.collect {
      case front
          if (front.isHidden && !front.collections
            .flatMap(c => c.items)
            .isEmpty) =>
        s"Front '${front.displayName}' is hidden but has content"
    }

  private def visibleDefaultNameFronts(fronts: List[EditionsFront]) = {
    fronts
      .filter(front => !front.isHidden)
      .map(front =>
        front.metadata
          .flatMap(m => m.nameOverride)
          .getOrElse(front.displayName)
      )
      .filter(s => s.matches("^Top Special.*"))
      .map(s => {
        s"Front '${s}' is visible and has default name"
      })
  }

  private def checkCollections(
      front: EditionsFront,
      collections: List[EditionsCollection]
  ): List[String] = {
    (
      visibleEmptyCollections(front, collections)
        :::
          invisibleNonEmptyCollections(front, collections)
          :::
          visibleDefaultNameCollections(front, collections)
    )
  }

  private def visibleDefaultNameCollections(
      front: EditionsFront,
      collections: List[EditionsCollection]
  ) = {
    collections
      .filter(collection =>
        collection.displayName.matches("^Special Container.*")
      )
      .filter(collection => !collection.isHidden)
      .map(collection =>
        s"Collection '${collection.displayName}' in '${front.displayName}' is visible and has default name"
      )
  }

  private def visibleEmptyCollections(
      front: EditionsFront,
      collections: List[EditionsCollection]
  ) = {
    collections
      .filter(collection => collection.items.isEmpty)
      .filter(collection => !collection.isHidden)
      .map(collection =>
        s"Collection '${collection.displayName}' in '${front.displayName}' is visible and empty"
      )
  }

  private def invisibleNonEmptyCollections(
      front: EditionsFront,
      collections: List[EditionsCollection]
  ) = {
    collections
      .filter(collection => !collection.items.isEmpty)
      .filter(collection => collection.isHidden)
      .map(collection =>
        s"Collection '${collection.displayName}' in '${front.displayName}' is hidden but has content"
      )
  }

}
