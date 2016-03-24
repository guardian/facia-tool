package controllers

import java.net.URLEncoder

import akka.actor.ActorSystem
import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import metrics.FaciaToolMetrics
import model.Cached
import play.api.Logger
import play.api.libs.ws.{WSAPI, WSAuthScheme, WSRequest}
import play.api.mvc._
import switchboard.SwitchManager
import util.ContentUpgrade.rewriteBody

import scala.concurrent.ExecutionContext.Implicits.global

class FaciaContentApiProxy(ws: WSAPI, val config: ApplicationConfiguration) extends Controller with PanDomainAuthActions {
  implicit class string2encodings(s: String) {
    lazy val urlEncoded = URLEncoder.encode(s, "utf-8")
  }

  implicit class RichWSRequest(wsRequest: WSRequest) {

    def withPreviewAuth: WSRequest = config.contentApi.previewAuth
      .foldLeft(wsRequest){ case (r, auth) => r.withAuth(auth.user, auth.password, WSAuthScheme.BASIC)}
  }

  override lazy val actorSystem = ActorSystem()

  def capiPreview(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost: String = if (SwitchManager.getStatus("facia-tool-draft-content"))
      config.contentApi.contentApiDraftHost
    else
      config.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${config.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    Logger.info(s"Proxying preview API query to: $url")

    ws.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def capiLive(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = config.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${config.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    Logger.info(s"Proxying live API query to: $url")

    ws.url(url).get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def http(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    ws.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("text/html")
      }
    }
  }

  def json(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    Logger.info(s"Proxying json request to: $url")

    ws.url(url).withPreviewAuth.get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/json")
      }
    }
  }

  def ophan(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val paths = request.queryString.get("path").map(_.mkString("path=", "&path=", "")).getOrElse("")
    val queryString = request.queryString.filterNot(_._1 == "path").filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")
    val ophanApiHost = config.ophanApi.host.get
    val ophanKey = config.ophanApi.key.map(key => s"&api-key=$key").getOrElse("")

    val url = s"$ophanApiHost/$path?$queryString&$paths&$ophanKey"

    Logger.info(s"Proxying ophan request to: $url")

    ws.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("application/json")
      }
    }
  }
}
