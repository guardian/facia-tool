package util

import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import org.scalatest.{FlatSpec, Matchers}

class SearchResponseUtilTest extends FlatSpec with Matchers {

  behavior of "aggregateResults"

  private val ignoredStr = "ignore"
  private val ignoredInt = -1
  private val dummyContent = Content(
    id = ignoredStr,
    webTitle = ignoredStr,
    webUrl = ignoredStr,
    apiUrl = ignoredStr
  )

  private val responseWith3TotalPagesWith2ItemsPerPage = SearchResponse(
    status = ignoredStr,
    userTier = ignoredStr,
    total = 6,
    startIndex = ignoredInt,
    pageSize = 2,
    currentPage = 1,
    pages = 3,
    orderBy = ignoredStr,
    results = Seq(dummyContent, dummyContent)
  )

  private val emptyResponse = responseWith3TotalPagesWith2ItemsPerPage.copy(
    total = 0,
    pageSize = 0,
    pages = 1,
    currentPage = 0,
    results = Nil
  )

  private def nextPage = (r: SearchResponse) => {
    val cur = r.currentPage
    r.copy(currentPage = cur + 1)
  }

  it should "aggregate all results into 1 SearchResponse for 3 pages" in {
    val firstPage = responseWith3TotalPagesWith2ItemsPerPage
    val secPage = nextPage(firstPage)
    val thirdPage = nextPage(secPage)
    val responses = Seq(firstPage, secPage, thirdPage)
    val actualResponse = SearchResponseUtil.aggregateResults(responses)

    actualResponse.results.size shouldEqual 6
    actualResponse.total shouldEqual 6
    actualResponse.pageSize shouldEqual 6
    actualResponse.pages shouldEqual 1
    actualResponse.currentPage shouldEqual 1
  }

  it should "handle situation if search result pages is 0" in {
    val responses = Seq(emptyResponse)
    val actualResponse = SearchResponseUtil.aggregateResults(responses)
    actualResponse.results.size shouldEqual 0
    actualResponse.total shouldEqual 0
    actualResponse.pageSize shouldEqual 0
    actualResponse.pages shouldEqual 1
    actualResponse.currentPage shouldEqual 1
  }

}
