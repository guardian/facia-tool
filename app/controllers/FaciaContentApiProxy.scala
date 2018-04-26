package controllers

import java.net.{URI, URLEncoder}

import akka.actor.ActorSystem
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.{IAMEncoder, IAMSigner}
import metrics.FaciaToolMetrics
import model.Cached
import play.api.Logger
import switchboard.SwitchManager
import util.ContentUpgrade.rewriteBody

import scala.concurrent.ExecutionContext.Implicits.global

class FaciaContentApiProxy(val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  implicit class string2encodings(s: String) {
    lazy val urlEncoded = URLEncoder.encode(s, "utf-8")
  }

  lazy val actorSystem = ActorSystem()

  private val previewSigner = {
    val capiPreviewCredentials = new AWSCredentialsProviderChain(
      new ProfileCredentialsProvider("capi"),
      new STSAssumeRoleSessionCredentialsProvider.Builder(config.contentApi.previewRole, "capi").build()
    )

    new IAMSigner(
      credentialsProvider = capiPreviewCredentials,
      awsRegion = config.aws.region
    )
  }

  private def getPreviewHeaders(url: String): Seq[(String,String)] =
    previewSigner.addIAMHeaders(headers = Map.empty, URI.create(url)).toSeq

  def capiPreview(path: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = IAMEncoder.encodeParams(request.queryString)

    val contentApiHost: String = if (SwitchManager.getStatus("facia-tool-draft-content"))
      config.contentApi.contentApiDraftHost
    else
      config.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${config.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    Logger.info(s"Proxying preview API query to: $url")

    wsClient.url(url).withHttpHeaders(getPreviewHeaders(url): _*).get().map { response =>
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

    wsClient.url(url).get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def http(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    wsClient.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("text/html")
      }
    }
  }

  def json(url: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    Logger.info(s"Proxying json request to: $url")

    wsClient.url(url).withHttpHeaders(getPreviewHeaders(url): _*).get().map { response =>
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

    wsClient.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("application/json")
      }
    }
  }
}
