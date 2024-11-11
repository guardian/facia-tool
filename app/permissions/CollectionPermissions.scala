package permissions

import com.gu.facia.client.models.ConfigJson

case class CollectionPermissions(val config: Option[ConfigJson]) {
  def getFrontsPermissionsPriorityByCollectionId(
      id: String
  ): Set[PermissionsPriority] = config match {
    case None =>
      Set.empty[
        PermissionsPriority
      ] // if there are no fronts in config, there can be no permissions....?
    case Some(config) => {
      config.fronts.values.collect {
        case front if (front.collections.contains(id)) =>
          // Will need the permission for this front
          PermissionsPriority.priorityOptionToPermissionPriority(front.priority)
      } match {
        // If this collection id is not present in any of the fronts, then it must belong to an edition issue
        case Nil => Set[PermissionsPriority](EditionsPermission)
        case permissionsFromFronts =>
          permissionsFromFronts
            .collect { case Some(a) => a }
            .toSet[PermissionsPriority]
      }
    }
  }

}
