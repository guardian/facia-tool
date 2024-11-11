package model

import com.gu.facia.client.models.Trail
import model.editions.client.EditionsClientCard
import play.api.libs.json.{Format, JsPath, JsValue, Json, Reads, Writes}
import play.api.libs.functional.syntax._

object ClipboardCard {
  def apply(trail: Trail): ClipboardCard = ClipboardCard(Left(trail))
  def apply(editionsCard: EditionsClientCard): ClipboardCard = ClipboardCard(
    Right(editionsCard)
  )

  val reads: Reads[ClipboardCard] =
    JsPath.read[EditionsClientCard].map(ClipboardCard.apply) or
      JsPath.read[Trail].map(ClipboardCard.apply)

  val writes = new Writes[ClipboardCard] {
    override def writes(o: ClipboardCard): JsValue =
      o.card.fold(
        trail => Json.toJson(trail),
        editionsCard => Json.toJson(editionsCard)
      )
  }

  implicit val format = Format(reads, writes)
}

case class ClipboardCard(card: Either[Trail, EditionsClientCard])
