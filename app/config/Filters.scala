package config

import play.api.mvc.ResponseHeader
import play.filters.gzip.GzipFilter

class CustomGzipFilter extends GzipFilter(shouldGzip = (_, response) => !Responses.isImage(response)) {}

object Responses {
  def isImage(r: ResponseHeader): Boolean = {
    r.headers.get("Content-Type").exists(_.startsWith("image/"))
  }
}
