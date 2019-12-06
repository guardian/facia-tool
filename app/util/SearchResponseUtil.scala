package util

import com.gu.contentapi.client.model.v1.{Content, SearchResponse}

object SearchResponseUtil {

  def aggregateResults(responses: Seq[SearchResponse]): SearchResponse = {
    val allResults: Seq[Content] = responses.flatMap(_.results)
    val count = allResults.size
    responses.head.copy(
      results = allResults,
      total = count,
      pages = 1,
      pageSize = count,
      currentPage = 1,
      startIndex = 1
    )
  }

}
