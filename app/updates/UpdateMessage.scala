package updates

import com.gu.facia.client.models.{CollectionConfigJson, FrontJson, TrailMetaData}
import julienrf.variants.Variants
import org.joda.time.DateTime
import play.api.libs.json._
import services.ConfigAgent

sealed trait UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent): Set[String]
}

/* Config updates */
object CreateFront {
  implicit val jsonFormat = Json.format[CreateFront].filter(_.id.matches("""^[a-z0-9\/\-+]*$"""))
}
case class CreateFront(
  id: String,
  navSection: Option[String],
  webTitle: Option[String],
  title: Option[String],
  imageUrl: Option[String],
  imageWidth: Option[Int],
  imageHeight: Option[Int],
  isImageDisplayed: Option[Boolean],
  description: Option[String],
  onPageDescription: Option[String],
  priority: Option[String],
  isHidden: Option[Boolean],
  initialCollection: CollectionConfigJson,
  group: Option[String]
) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = Set(id)
}

case class UpdateFront(id: String, front: FrontJson) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = Set(id)
}

case class CollectionCreate(frontIds: List[String], collection: CollectionConfigJson, collectionId: String) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = frontIds.toSet[String]
}
case class CollectionUpdate(frontIds: List[String], collection: CollectionConfigJson, collectionId: String) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = frontIds.toSet[String]
}


/* Collection updates */
case class UpdateList(
  id: String,
  item: String,
  position: Option[String],
  after: Option[Boolean],
  itemMeta: Option[TrailMetaData],
  live: Boolean,
  draft: Boolean
) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent): Set[String] = configAgent.getConfigsUsingCollectionId(id).toSet[String]
}
object UpdateList {
  implicit val format: Format[UpdateList] = Json.format[UpdateList]
}

case class Update(update: UpdateList) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = update.affectedFronts(configAgent)
}
case class Remove(remove: UpdateList) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = remove.affectedFronts(configAgent)
}

case class UpdateAndRemove(update: UpdateList, remove: UpdateList) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = update.affectedFronts(configAgent) ++ remove.affectedFronts(configAgent)
}

case class DiscardUpdate(id: String) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = configAgent.getConfigsUsingCollectionId(id).toSet[String]
}
case class PublishUpdate(id: String) extends UpdateMessage {
  def affectedFronts(configAgent: ConfigAgent) = configAgent.getConfigsUsingCollectionId(id).toSet[String]
}

/* Macro - Watch out, this needs to be after the case classes */
object UpdateMessage {
  implicit val format: Format[UpdateMessage] = Variants.format[UpdateMessage]((__ \ "type").format[String])
}

/* Kinesis messages */
case class StreamUpdate(update: UpdateMessage, email: String) {
  def fronts(configAgent: ConfigAgent): Set[String] = update.affectedFronts(configAgent)
  val dateTime: DateTime = new DateTime()
}
object StreamUpdate {
  implicit val streamUpdateFormat: Format[StreamUpdate] = Json.format[StreamUpdate]
}
