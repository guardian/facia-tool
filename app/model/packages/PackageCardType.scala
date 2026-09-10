package model.packages

sealed trait PackageCardType {
  def toString: String
}

object PackageCardType {
  // Feast card types
  case object Recipe extends PackageCardType {
    override def toString = "recipe"
  }

  case object Chef extends PackageCardType {
    override def toString = "chef"
  }

  case object Subcollection extends PackageCardType {
    override def toString = "subcollection"
  }

  def fromString(value: String): Option[PackageCardType] = value match {
    case "recipe"        => Some(Recipe)
    case "chef"          => Some(Chef)
    case "subcollection" => Some(Subcollection)
    case _               => None
  }

  def apply(value: String) = fromString(value)
}
