package logic

import model.editions.{EditionsCollection, EditionsFront, EditionsIssue}

object EditionsChecker {

  def checkIssue(issue: EditionsIssue): List[String] =
    if (issue.fronts.isEmpty)
      List(s"Issue is empty")
    else
      checkFronts(issue.fronts)

  private def checkFronts(fronts: List[EditionsFront]): List[String] = {
    (
      visibleDefaultNameFronts(fronts)
      :::
      visibleEmptyFronts(fronts)
      :::
      checkFrontsCollections(fronts)
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

  private def visibleEmptyFronts(fronts: List[EditionsFront]) = {
    fronts.flatMap(front => {
      if (!front.isHidden && front.collections.isEmpty)
        Set(s"Front '${front.displayName}' is visible and empty")
      else
        List()
    })
  }

  private def visibleDefaultNameFronts(fronts: List[EditionsFront]) = {
    fronts
      .filter(front => !front.isHidden)
      .map(front =>
        front
          .metadata
          .flatMap(m => m.nameOverride)
          .getOrElse(front.displayName))
      .filter(s => s.matches("^Top Special.*"))
      .map(s => {
        println(s);
        s"Front '${s}' is visible and has default name"
      })
  }

  private def checkCollections(front: EditionsFront, collections: List[EditionsCollection]): List[String] = {
    (
      visibleEmptyCollections(front, collections)
      :::
      visibleDefaultNameCollections(front, collections)
    )
  }

  private def visibleDefaultNameCollections(front: EditionsFront, collections: List[EditionsCollection]) = {
    collections
      .filter(collection => collection.displayName.matches("^Special Container.*"))
      .filter(collection => !collection.isHidden)
      .map(collection => s"Collection '${collection.displayName}' in '${front.displayName}' is visible and has default name")
  }

  private def visibleEmptyCollections(front: EditionsFront, collections: List[EditionsCollection]) = {
    collections
      .filter(collection => collection.items.isEmpty)
      .filter(collection => !collection.isHidden)
      .map(collection => s"Collection '${collection.displayName}' in '${front.displayName}' is visible and empty")
  }
}
