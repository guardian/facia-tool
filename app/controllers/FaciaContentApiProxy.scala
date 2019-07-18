package controllers

import java.net.{URI, URLEncoder}

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.{IAMEncoder, IAMSigner}
import metrics.FaciaToolMetrics
import model.Cached
import play.api.libs.concurrent.Futures
import play.api.libs.concurrent.Futures._

import scala.concurrent.duration._
import logging.Logging
import services.Capi
import switchboard.SwitchManager
import util.ContentUpgrade.rewriteBody

import scala.concurrent.ExecutionContext


class FaciaContentApiProxy(capi: Capi, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) with Logging {
  implicit val futures = new play.api.libs.concurrent.DefaultFutures(akka.actor.ActorSystem())
  implicit class string2encodings(s: String) {
    lazy val urlEncoded = URLEncoder.encode(s, "utf-8")
  }

  def capiPreview(path: String) = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = IAMEncoder.encodeParams(request.queryString)

    val contentApiHost: String = if (SwitchManager.getStatus("facia-tool-draft-content"))
      config.contentApi.contentApiDraftHost
    else
      config.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${config.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"
    
    wsClient.url(url).withHttpHeaders(capi.getPreviewHeaders(url): _*).get().map { response =>

      if (response.status != OK) {
        logger.error(s"Request to capi preview with url $url failed with response $response, ${response.body}")
      }
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def capiLive(path: String) = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val queryString = request.queryString.filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")

    val contentApiHost = config.contentApi.contentApiLiveHost

    val url = s"$contentApiHost/$path?$queryString${config.contentApi.key.map(key => s"&api-key=$key").getOrElse("")}"

    wsClient.url(url).get().map { response =>

      if (response.status != OK) {
        logger.error(s"Request to live capi with url $url failed with response $response, ${response.body}")
      }
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/javascript")
      }
    }
  }

  def http(url: String) = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    wsClient.url(url).get().map { response =>
      Cached(60) {
        Ok(response.body).as("text/html")
      }
    }
  }

  def json(url: String) = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()

    wsClient.url(url).withHttpHeaders(capi.getPreviewHeaders(url): _*).get().map { response =>
      Cached(60) {
        Ok(rewriteBody(response.body)).as("application/json")
      }
    }
  }

  def ophan(path: String) = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ProxyCount.increment()
    val paths = request.queryString.get("path").map(_.mkString("path=", "&path=", "")).getOrElse("")
    val queryString = request.queryString.filterNot(_._1 == "path").filter(_._2.exists(_.nonEmpty)).map { p =>
       "%s=%s".format(p._1, p._2.head.urlEncoded)
    }.mkString("&")
    val ophanApiHost = config.ophanApi.host.get
    val ophanKey = config.ophanApi.key.map(key => s"&api-key=$key").getOrElse("")

    val url = s"$ophanApiHost/$path?$queryString&$paths&$ophanKey"

    logger.info(s"Request to ophan: $url")
    wsClient.url(url).get().withTimeout(5.seconds).map { response =>
      Cached(60) {
        Ok(response.body).as("application/json")
      }
    }.recover {
      case e: scala.concurrent.TimeoutException => {
        logger.error(s"Request to ophan with url $url timed out")
        GatewayTimeout
      }
    }
  }
}
