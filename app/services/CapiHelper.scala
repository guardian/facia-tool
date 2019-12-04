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
    val firstPageResponse = Await.result(getResponse(query.page(1)), FirstPageReqTimeout)
    val totalPages = firstPageResponse.pages

    if (totalPages == 0 || totalPages == 1) return List(firstPageResponse)

    val remainingPages = readRemainingPages(totalPages, query, getResponse)
    val allResponsePages: List[SearchResponse] = firstPageResponse +: remainingPages
    logger.info(s"readAllSearchResponsePages, fetched CAPI search Response pages count ${allResponsePages.size}")
    allResponsePages
  }

  private def readRemainingPages(totalPages: Int, query: CapiQueryGenerator,
                                 getResponse: CapiQueryGenerator => Future[SearchResponse])(implicit ex: ExecutionContext): List[SearchResponse] = {
    val RemainingPagesReqTimeout = Duration(5, TimeUnit.SECONDS)
    val remainingPages = (1 to totalPages).tail
    val restFutures: List[Future[SearchResponse]] = (for (nextPageNum <- remainingPages) yield getResponse(query.page(nextPageNum))).toList
    Await.result(Future.sequence(restFutures), RemainingPagesReqTimeout)
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
