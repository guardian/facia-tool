package permissions

sealed trait PermissionsPriority
case object EditorialPermission extends PermissionsPriority
case object CommercialPermission extends PermissionsPriority
case object EmailPermission extends PermissionsPriority
case object TrainingPermission extends PermissionsPriority
case object EditionsPermission extends PermissionsPriority

object PermissionsPriority {
  def priorityOptionToPermissionPriority(
      os: Option[String]
  ): Option[PermissionsPriority] = {
    os.flatMap(stringToPermissionPriority).orElse(Some(EditorialPermission))
  }
  def stringToPermissionPriority(s: String): Option[PermissionsPriority] = {
    s.toLowerCase match {
      case "editorial"  => Some(EditorialPermission)
      case "commercial" => Some(CommercialPermission)
      case "email"      => Some(EmailPermission)
      case "training"   => Some(TrainingPermission)
      case "edition"    => Some(EditionsPermission)
      case _            => None
    }
  }
}
