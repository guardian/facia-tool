package services

import java.util.concurrent.TimeUnit

import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model.v1.SearchResponse

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

object CapiClientHelper {
  def apply(apiClient: GuardianContentClient)(implicit ex: ExecutionContext): CapiClientHelper = new CapiClientHelper(apiClient)(ex)
}

class CapiClientHelper(apiClient: GuardianContentClient)(implicit ex: ExecutionContext) {

  // implementation using capi scala client we get inaccurate results
  // TODO investigate that
  //
  //  val paginateFoldRes = client.paginateFold(query)(Seq(): Seq[SearchResponse]) {
  //    (response: SearchResponse, acc: Seq[SearchResponse]) => acc :+ response
  //  }
  //
  //  val response: List[SearchResponse] = Await.result(paginateFoldRes, Duration(3, TimeUnit.SECONDS)).toList


  def readAllSearchResponsePages(query: CapiQueryGenerator): List[SearchResponse] = {
    val FirstPageReqTimeout = Duration(3, TimeUnit.SECONDS)
    val RemainingPagesReqTimeout = Duration(5, TimeUnit.SECONDS)
    val firstPageResponse = Await.result(apiClient.getResponse(query.page(1)), FirstPageReqTimeout)
    val totalPages = firstPageResponse.pages
    val remainingPages = (1 to totalPages).tail

    if (remainingPages.isEmpty) return List(firstPageResponse)

    val restFutures: List[Future[SearchResponse]] = (for (nextPageNum <- remainingPages) yield {
      apiClient.getResponse(query.page(nextPageNum))
    }).toList

    val rest = Await.result(Future.sequence(restFutures), RemainingPagesReqTimeout)
    firstPageResponse +: rest
  }

}
