package config

import org.apache.pekko.stream.Materializer
import play.api.mvc.ResponseHeader
import play.filters.gzip.GzipFilter

class CustomGzipFilter(implicit val materializer: Materializer)
    extends GzipFilter(shouldGzip =
      (_, response) => !Responses.isImage(response.header)
    )(materializer) {}

object Responses {
  def isImage(r: ResponseHeader): Boolean = {
    r.headers.get("Content-Type").exists(_.startsWith("image/"))
  }
}
