package permissions

import com.gu.facia.client.models.ConfigJson

object CollectionPermissions {
  def getFrontsPermissionsPriorityByCollectionId(config: Option[ConfigJson], id: String): Set[PermissionsPriority] = config match {
    case None => Set.empty[PermissionsPriority] // if there are no fronts in config, there can be no permissions....?
    case Some(config) => {
      config.fronts.values.flatMap(front =>
        if (front.collections.contains(id))
          // Will need the permission for this front
          PermissionsPriority.priorityOptionToPermissionPriority(front.priority)
        else
          None
    ) match {
        // If this collection id is not present in any of the fronts, then it must belong to an edition issue
        case Nil => Set[PermissionsPriority](EditionsPermission)
        case permissionsFromFronts => permissionsFromFronts.toSet
      }
    }
  }

}
