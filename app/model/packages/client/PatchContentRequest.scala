package model.packages.client

import play.api.libs.json.{
  Format,
  JsError,
  JsNumber,
  JsResult,
  JsString,
  JsSuccess,
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
          (
            (json \ "atIndex").validate[Int],
            (json \ "item").validate[ClientPackageCard]
          ) match {
            case (JsSuccess(atIndex, _), JsSuccess(item, _)) =>
              JsSuccess(AddContentItem(item, atIndex))
            case (_, JsError(err)) => // show error for item first
              JsError(err)
            case (JsError(err), _) =>
              JsError(err)
          }
        case "Remove" =>
          (json \ "itemId").validate[String].map(RemoveContentItem.apply)
        case other => JsError(s"Unknown opType: $other")
      }
    }

    override def writes(item: PatchContentItem): JsValue = item match {
      case AddContentItem(contentItem, atIndex) =>
        Json.obj(
          opTypeField -> JsString("Add"),
          "atIndex" -> JsNumber(atIndex),
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
