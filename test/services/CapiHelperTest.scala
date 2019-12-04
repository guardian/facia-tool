package services

import java.time.{LocalDate, ZoneOffset}

import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import model.editions.PathType
import org.scalatest.{BeforeAndAfterEach, FlatSpec, FunSuite, Matchers}

import scala.concurrent.{ExecutionContext, Future}

class CapiHelperTest extends FlatSpec with BeforeAndAfterEach with Matchers {

  implicit val ctx: ExecutionContext = ExecutionContext.global

  private val ignoredStr = "ignore"
  private val ignoredInt = -1
  private val dummyContent = Content(
    id = ignoredStr,
    webTitle = ignoredStr,
    webUrl = ignoredStr,
    apiUrl = ignoredStr,
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

  private val responseWith1PageWith2ItemsPerPage = responseWith3TotalPagesWith2ItemsPerPage.copy(total = 2, pageSize = 2, pages = 1)
  private val emptyResponse = responseWith3TotalPagesWith2ItemsPerPage.copy(total = 0, pageSize = 0, pages = 1, currentPage = 0, results = Nil)

  private var getResponseCallsCounter = 0

  override def beforeEach(): Unit = getResponseCallsCounter = 0

  private val genFakeGetResponseFunction = (sr: SearchResponse) => (q: CapiQueryGenerator) => {
    getResponseCallsCounter += 1
    val curPage: Int = q.parameters.getOrElse("page", 1).toString.toInt
    Future.successful(sr.copy(currentPage = curPage))
  }

  behavior of "readAllSearchResponsePages"

  private val query = CapiQueryGenerator(PathType.Search).showTags("all")
    .orderBy("newest")
    .page(1)
    .pageSize(2)
    .tag("theguardian/mainsection/topstories")
    .fromDate(LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC))
    .toDate(LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC))
    .useDate("newspaper-edition")

  it should "read all pages of paginated response" in {
    val getResponse = genFakeGetResponseFunction(responseWith3TotalPagesWith2ItemsPerPage)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)
    actual.map(_.total) shouldEqual List(6, 6, 6)
    actual.map(_.pageSize) shouldEqual List(2, 2, 2)
    actual.map(_.currentPage) shouldEqual List(1, 2, 3)
    actual.map(_.pages) shouldEqual List(3, 3, 3)
    actual.flatMap(_.results).size shouldEqual 6
    getResponseCallsCounter shouldEqual 3
  }

  it should "get response for 1 page search result" in {
    val getResponse = genFakeGetResponseFunction(responseWith1PageWith2ItemsPerPage)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)
    actual.map(_.total) shouldEqual List(2)
    actual.map(_.pageSize) shouldEqual List(2)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.pages) shouldEqual List(1)
    actual.flatMap(_.results).size shouldEqual 2
    getResponseCallsCounter shouldEqual 1
  }

  it should "handle situation if search result pages is 0" in {
    val getResponse = genFakeGetResponseFunction(emptyResponse)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)

    actual.map(_.total) shouldEqual List(0)
    actual.map(_.pageSize) shouldEqual List(0)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.pages) shouldEqual List(1)
    actual.flatMap(_.results).size shouldEqual 0

    getResponseCallsCounter shouldEqual 1
  }

  behavior of "aggregateResults"

  private val dummyFilter = (c: Content) => true

  private def nextPage = (r: SearchResponse) => {
    val cur = r.currentPage
    r.copy(currentPage = cur + 1)
  }

  it should "aggregate all results into 1 SearchResponse for 3 pages" in {
    val firstPage = responseWith3TotalPagesWith2ItemsPerPage
    val secPage = nextPage(firstPage)
    val thirdPage = nextPage(secPage)
    val responses = Seq(firstPage, secPage, thirdPage)
    val actualResponse = CapiHelper.aggregateResults(responses, dummyFilter)

    actualResponse.results.size shouldEqual 6
    actualResponse.total shouldEqual 6
    actualResponse.pageSize shouldEqual 6
    actualResponse.pages shouldEqual 1
    actualResponse.currentPage shouldEqual 1
  }

  it should "handle situation if search result pages is 0" in {
    val responses = Seq(emptyResponse)
    val actualResponse = CapiHelper.aggregateResults(responses, dummyFilter)
    actualResponse.results.size shouldEqual 0
    actualResponse.total shouldEqual 0
    actualResponse.pageSize shouldEqual 0
    actualResponse.pages shouldEqual 1
    actualResponse.currentPage shouldEqual 1
  }

}
