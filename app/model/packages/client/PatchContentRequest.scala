package model.packages.client

import play.api.libs.json.{
  Format,
  JsError,
  JsResult,
  JsString,
  JsValue,
  Json,
  OFormat
}

sealed trait PatchContentItem {
  def opType: String
}

final case class AddContentItem(item: ClientPackageCard, atIndex: Int)
    extends PatchContentItem {
  override val opType: String = "Add"
}

final case class RemoveContentItem(itemId: String) extends PatchContentItem {
  override val opType: String = "Remove"
}

object PatchContentItem {
  private val opTypeField = "opType"

  implicit val format: Format[PatchContentItem] = new Format[PatchContentItem] {
    override def reads(json: JsValue): JsResult[PatchContentItem] = {
      (json \ opTypeField).validate[String].flatMap {
        case "Add" =>
          (json \ "item").validate[ClientPackageCard].map(AddContentItem.apply)
        case "Remove" =>
          (json \ "itemId").validate[String].map(RemoveContentItem.apply)
        case other => JsError(s"Unknown opType: $other")
      }
    }

    override def writes(item: PatchContentItem): JsValue = item match {
      case AddContentItem(contentItem) =>
        Json.obj(
          opTypeField -> JsString("Add"),
          "item" -> Json.toJson(contentItem)
        )
      case RemoveContentItem(itemId) =>
        Json.obj(
          opTypeField -> JsString("Remove"),
          "itemId" -> JsString(itemId)
        )
    }
  }
}

final case class PatchContentRequest(ops: Seq[PatchContentItem])

object PatchContentRequest {
  implicit val format: OFormat[PatchContentRequest] =
    Json.format[PatchContentRequest]
}
