import play.filters.gzip.GzipFilter
import play.api.mvc.ResponseHeader

object Gzipper extends GzipFilter(shouldGzip = (_, resp) => !Responses.isImage(resp))

object Responses {
  def isImage(r: ResponseHeader): Boolean = {
    r.headers.get("Content-Type").exists(_.startsWith("image/"))
  }
}
