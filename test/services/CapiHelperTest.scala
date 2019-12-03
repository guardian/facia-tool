package services

import java.time.{LocalDate, ZoneOffset}

import com.gu.contentapi.client.model.v1.SearchResponse
import model.editions.PathType
import org.scalatest.{BeforeAndAfterEach, FlatSpec, FunSuite, Matchers}

import scala.concurrent.{ExecutionContext, Future}

class CapiHelperTest extends FlatSpec with BeforeAndAfterEach with Matchers {

  implicit val ctx: ExecutionContext = ExecutionContext.global

  private val searchResponseWith3TotalPages = SearchResponse(
    status = "200",
    userTier = "test",
    total = 3,
    startIndex = 1,
    pageSize = 2,
    currentPage = 1,
    pages = 3,
    orderBy = "newest"
  )

  private val searchResponseWith1Page = searchResponseWith3TotalPages.copy(total = 1, pages = 1)

  private val searchResponseWith0Pages = searchResponseWith3TotalPages.copy(total = 0, pages = 0, currentPage = 0, startIndex = 0)

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
    val getResponse = genFakeGetResponseFunction(searchResponseWith3TotalPages)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)
    actual.map(_.currentPage) shouldEqual List(1, 2, 3)
    actual.map(_.total) shouldEqual List(3, 3, 3)
    getResponseCallsCounter shouldEqual 3
  }

  it should "get response for 1 page search result" in {
    val getResponse = genFakeGetResponseFunction(searchResponseWith1Page)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.total) shouldEqual List(1)
    getResponseCallsCounter shouldEqual 1
  }

  it should "handle situation if search result pages is 0" in {
    val getResponse = genFakeGetResponseFunction(searchResponseWith0Pages)
    val actual = CapiHelper.readAllSearchResponsePages(query, getResponse)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.total) shouldEqual List(0)
    getResponseCallsCounter shouldEqual 1
  }

}
