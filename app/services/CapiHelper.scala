package services

import java.util.concurrent.TimeUnit

import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import logging.Logging

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

object CapiHelper extends Logging {

  // Capi Scala client have functions that reads paginated responses
  // but they give inaccurate results (most of the time it gives only the first page)
  // TODO investigate that
  //
  //  val paginateFoldRes = client.paginateFold(query)(Seq(): Seq[SearchResponse]) {
  //    (response: SearchResponse, acc: Seq[SearchResponse]) => acc :+ response
  //  }
  //
  //  val response: List[SearchResponse] = Await.result(paginateFoldRes, Duration.Inf).toList


  def readAllSearchResponsePages(query: CapiQueryGenerator,
                                 getResponse: CapiQueryGenerator => Future[SearchResponse])(implicit ex: ExecutionContext): List[SearchResponse] = {
    val FirstPageReqTimeout = Duration(3, TimeUnit.SECONDS)
    val RemainingPagesReqTimeout = Duration(5, TimeUnit.SECONDS)
    val firstPageResponse = Await.result(getResponse(query.page(1)), FirstPageReqTimeout)
    val totalPages = firstPageResponse.pages

    if (totalPages == 0) return List(firstPageResponse)

    val remainingPages = (1 to totalPages).tail

    if (remainingPages.isEmpty) return List(firstPageResponse)

    val restFutures: List[Future[SearchResponse]] = (for (nextPageNum <- remainingPages) yield getResponse(query.page(nextPageNum))).toList

    val rest = Await.result(Future.sequence(restFutures), RemainingPagesReqTimeout)
    val responses: List[SearchResponse] = firstPageResponse +: rest
    logger.info(s"readAllSearchResponsePages, fetched CAPI search Response pages count ${responses.size}")
    responses
  }

  def aggregateResults(responses: Seq[SearchResponse], resultsFilter: Content => Boolean): SearchResponse = {
    val allResults: Seq[Content] = responses.flatMap(_.results)
    val filteredResults = allResults.filter(resultsFilter)
    val count = filteredResults.size

    responses.head.copy(
      results = filteredResults,
      total = count,
      pages = 1,
      pageSize = count,
      currentPage = 1,
      startIndex = 1
    )
  }

}
