package logic

import model.editions.{EditionsCollection, EditionsFront, EditionsIssue}

object EditionsChecker {

  def check(issue: EditionsIssue): List[String] =
    if (issue.fronts.isEmpty)
      List(s"Issue is empty")
    else
      check(issue.fronts)

  def check(fronts: List[EditionsFront]): List[String] = {
    (
      fronts
        .filter(front => !front.isHidden)
        .map(front =>
          front
            .metadata
            .flatMap(m => m.nameOverride)
            .getOrElse(front.displayName))
        .filter(s => s.matches("^Top Special.*"))
        .map(s => {println(s); s"Front '${s}' is visible and has default name"})
      :::
      fronts.flatMap(front => {
        if (!front.isHidden && front.collections.isEmpty)
          Set(s"Front '${front.displayName}' is visible and empty")
        else {
          if (!front.isHidden)
            check(front, front.collections)
          else
            List()
        }
      })
    )
  }

  def check(front: EditionsFront, collections: List[EditionsCollection]): List[String] = {
    (
      collections
        .filter(collection => collection.items.isEmpty)
        .filter(collection => !collection.isHidden)
        .map(collection => s"Collection '${collection.displayName}' in '${front.displayName}' is visible and empty")
      :::
      collections
        .filter(collection => collection.displayName.matches("^Special Container.*"))
        .filter(collection => !collection.isHidden)
        .map(collection => s"Collection '${collection.displayName}' in '${front.displayName}' is visible and has default name")
    )
  }

}
