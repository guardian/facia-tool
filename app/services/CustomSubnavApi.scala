package services

import com.gu.facia.client.models.{CustomSubnav, CustomSubnavConfig}
import com.gu.pandomainauth.model.User
import org.joda.time.DateTime
import play.api.libs.json.Json
import logging.Logging

import scala.util.{Failure, Success, Try}

object CustomSubnavConfigFunctions extends Logging {
  val empty: CustomSubnavConfig = CustomSubnavConfig(live = Nil, draft = Nil)

  /** Stamp the audit fields server-side */
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

  private def contentEquals(a: CustomSubnav, b: CustomSubnav): Boolean =
    a.copy(
      lastUpdated = b.lastUpdated,
      updatedBy = b.updatedBy,
      updatedEmail = b.updatedEmail
    ) == b

  def upsertDraft(
      config: CustomSubnavConfig,
      subnav: CustomSubnav
  ): CustomSubnavConfig = {
    val collapsesIntoLive =
      config.live.find(_.id == subnav.id).exists(contentEquals(_, subnav))

    val newDraft =
      if (collapsesIntoLive)
        config.draft.filterNot(_.id == subnav.id)
      else if (config.draft.exists(_.id == subnav.id)) {
        logger.info(s"Updating existing draft subnav with id ${subnav.id}")
        config.draft.map(s => if (s.id == subnav.id) subnav else s)
      } else
        config.draft :+ subnav

    config.copy(draft = newDraft)
  }

  def publish(
      config: CustomSubnavConfig,
      id: String
  ): Option[CustomSubnavConfig] =
    config.draft.find(_.id == id).map { subnav =>
      val newLive =
        if (config.live.exists(_.id == id))
          config.live.map(s => if (s.id == id) subnav else s)
        else
          config.live :+ subnav
      config.copy(live = newLive, draft = config.draft.filterNot(_.id == id))
    }

  def discard(
      config: CustomSubnavConfig,
      id: String
  ): Option[CustomSubnavConfig] =
    if (config.draft.exists(_.id == id))
      Some(config.copy(draft = config.draft.filterNot(_.id == id)))
    else None

  /** Drops a published subnav from the live entry into draft. Any existing
    * draft edits for that id are overwritten by the live copy
    */
  def unpublish(
      config: CustomSubnavConfig,
      id: String
  ): Option[CustomSubnavConfig] =
    config.live.find(_.id == id).map { liveSubnav =>
      val newDraft =
        if (config.draft.exists(_.id == id))
          config.draft.map(s => if (s.id == id) liveSubnav else s)
        else
          config.draft :+ liveSubnav
      config.copy(live = config.live.filterNot(_.id == id), draft = newDraft)
    }

  def delete(
      config: CustomSubnavConfig,
      id: String
  ): Option[CustomSubnavConfig] =
    if (config.live.exists(_.id == id) || config.draft.exists(_.id == id))
      Some(
        config.copy(
          live = config.live.filterNot(_.id == id),
          draft = config.draft.filterNot(_.id == id)
        )
      )
    else None
}

class CustomSubnavApi(s3FrontsApi: S3FrontsApi) extends Logging {

  def getConfig(): Either[String, CustomSubnavConfig] =
    s3FrontsApi.getCustomSubnav match {
      case None => Right(CustomSubnavConfigFunctions.empty)
      case Some(raw) =>
        Try(Json.parse(raw).as[CustomSubnavConfig]) match {
          case Success(config) => Right(config)
          case Failure(e) =>
            logger.error(
              "Stored custom subnav config could not be parsed; falling back to empty config",
              e
            )
            Left(
              "Stored custom subnav config could not be parsed and an empty config is being shown."
            )
        }
    }

  def putConfig(config: CustomSubnavConfig): Try[CustomSubnavConfig] = {
    val result =
      Try(s3FrontsApi.putCustomSubnav(Json.prettyPrint(Json.toJson(config))))
        .map(_ => config)
    result.failed.foreach(e =>
      logger.error("Failed to persist custom subnav config to S3", e)
    )
    result
  }
}
