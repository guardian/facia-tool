package conf

import common._
import model.Cors
import play.api.{Logger, Application, GlobalSettings}
import play.api.mvc.{Result, RequestHeader, Results}

import scala.concurrent.Future
import scala.util.control.NonFatal

trait CorsErrorHandler extends GlobalSettings with Results with common.ExecutionContexts {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def onError(request: RequestHeader, ex: Throwable) = {
    // Overriding onError in Dev can hide helpful Exception messages.
    if (play.Play.isDev) {
      super.onError(request, ex)
    } else {
      val headers = request.headers
      val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))

      Future.successful {
        Cors(InternalServerError.withHeaders("Vary" -> vary))(request)
      }
    }
  }

  override def onHandlerNotFound(request : RequestHeader) : Future[Result] = {
    super.onHandlerNotFound(request).map { Cors(_)(request) };
  }
  override def onBadRequest(request : RequestHeader, error : String) : Future[Result] = {
    super.onBadRequest(request, error).map { Cors(_)(request) };
  }
}

trait LogStashConfig extends GlobalSettings with Logging {

  override def onStart(app: Application) {
    super.onStart(app)
    Logger.info("configuring log stash")
    try LogStash.init()
    catch {
      case NonFatal(e) => Logger.error(s"could not configure log stream ${e}")
    }
  }

}
