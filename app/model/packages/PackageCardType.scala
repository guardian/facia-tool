package model.packages

import play.api.libs.json.{Reads, Writes, JsSuccess, JsError, JsString}

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

  case object Invalid extends PackageCardType {
    override def toString = "invalid"
  }

  def fromString(value: String): Option[PackageCardType] = value match {
    case "recipe"        => Some(Recipe)
    case "chef"          => Some(Chef)
    case "subcollection" => Some(Subcollection)
    case _               => None
  }

  def apply(value: String): Option[PackageCardType] = fromString(value)

  implicit val reads: Reads[PackageCardType] = Reads { json =>
    json.asOpt[String].flatMap(fromString) match {
      case Some(value) => JsSuccess(value)
      case None        => JsError("Invalid PackageCardType")
    }
  }

  implicit val writes: Writes[PackageCardType] = Writes { cardType =>
    JsString(cardType.toString)
  }
}
