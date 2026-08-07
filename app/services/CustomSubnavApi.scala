package services

import com.gu.facia.client.models.{CustomSubnav, CustomSubnavConfig}
import com.gu.pandomainauth.model.User
import org.joda.time.DateTime
import play.api.libs.json.Json
import logging.Logging

import scala.util.Try

/** Pure, unit-testable transforms over a [[CustomSubnavConfig]].
  *
  * The stored document (`{stage}/frontsapi/navigation/custom-subnav.json`) holds
  * two parallel lists of subnavs:
  *   - `live`  – what dotcom renders in production
  *   - `draft` – previewable, unpublished changes (an overlay on top of live)
  *
  * The lifecycle mirrors fronts/collections but operates per-subnav (matched by
  * `id`): saving upserts into `draft`, publishing promotes a single draft entry
  * into `live`, and discarding drops a single entry from `draft`.
  */
object CustomSubnavConfigFunctions {
  val empty: CustomSubnavConfig = CustomSubnavConfig(live = Nil, draft = Nil)

  /** Stamp the audit fields server-side so we never trust client-supplied values. */
  def stamp(
      subnav: CustomSubnav,
      identity: User,
      now: DateTime = DateTime.now
  ): CustomSubnav =
    subnav.copy(
      lastUpdated = now,
      updatedBy = s"${identity.firstName} ${identity.lastName}",
      updatedEmail = identity.email
    )

  /** Two subnavs are considered content-equal if they only differ by audit fields. */
  private def contentEquals(a: CustomSubnav, b: CustomSubnav): Boolean =
    a.copy(
      lastUpdated = b.lastUpdated,
      updatedBy = b.updatedBy,
      updatedEmail = b.updatedEmail
    ) == b

  /** Upsert the subnav into the draft list (matched by id, preserving position).
    * If the draft copy is content-identical to its live counterpart, the change
    * is a no-op and the entry is dropped from draft instead.
    */
  def upsertDraft(
      config: CustomSubnavConfig,
      subnav: CustomSubnav
  ): CustomSubnavConfig = {
    val collapsesIntoLive =
      config.live.find(_.id == subnav.id).exists(contentEquals(_, subnav))

    val newDraft =
      if (collapsesIntoLive)
        config.draft.filterNot(_.id == subnav.id)
      else if (config.draft.exists(_.id == subnav.id))
        config.draft.map(s => if (s.id == subnav.id) subnav else s)
      else
        config.draft :+ subnav

    config.copy(draft = newDraft)
  }

  /** Promote the draft subnav with the given id into live (replacing any existing
    * live entry with the same id), and remove it from draft. No-op if the id is
    * not present in draft.
    */
  def publish(config: CustomSubnavConfig, id: String): CustomSubnavConfig =
    config.draft.find(_.id == id) match {
      case Some(subnav) =>
        val newLive =
          if (config.live.exists(_.id == id))
            config.live.map(s => if (s.id == id) subnav else s)
          else
            config.live :+ subnav
        config.copy(live = newLive, draft = config.draft.filterNot(_.id == id))
      case None => config
    }

  /** Discard unpublished changes for the given id (remove from draft only). */
  def discard(config: CustomSubnavConfig, id: String): CustomSubnavConfig =
    config.copy(draft = config.draft.filterNot(_.id == id))

  /** Take a published subnav off production: move the live entry into draft and
    * remove it from live, so it stops rendering but stays editable. Any existing
    * draft edits for that id are overwritten by the live copy (the UI warns the
    * editor that pending draft changes will be undone). No-op if the id is not
    * currently live.
    */
  def unpublish(config: CustomSubnavConfig, id: String): CustomSubnavConfig =
    config.live.find(_.id == id) match {
      case Some(liveSubnav) =>
        val newDraft =
          if (config.draft.exists(_.id == id))
            config.draft.map(s => if (s.id == id) liveSubnav else s)
          else
            config.draft :+ liveSubnav
        config.copy(live = config.live.filterNot(_.id == id), draft = newDraft)
      case None => config
    }

  /** Remove the subnav entirely, dropping it from both live and draft. */
  def delete(config: CustomSubnavConfig, id: String): CustomSubnavConfig =
    config.copy(
      live = config.live.filterNot(_.id == id),
      draft = config.draft.filterNot(_.id == id)
    )
}

/** Reads and writes the custom subnav config directly from S3 (uncached) so that
  * read-modify-write edits always see the latest persisted state.
  */
class CustomSubnavApi(s3FrontsApi: S3FrontsApi) extends Logging {

  def getConfig(): CustomSubnavConfig =
    s3FrontsApi.getCustomSubnav
      .flatMap(raw => Json.parse(raw).asOpt[CustomSubnavConfig])
      .getOrElse(CustomSubnavConfigFunctions.empty)

  def putConfig(config: CustomSubnavConfig): CustomSubnavConfig = {
    Try(s3FrontsApi.putCustomSubnav(Json.prettyPrint(Json.toJson(config))))
    config
  }
}
