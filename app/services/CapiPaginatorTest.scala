package services

import java.time.{LocalDate, ZoneOffset}

import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model.v1.SearchResponse
import model.editions.PathType

import scala.concurrent.ExecutionContext

object CapiPaginatorTest extends App {

  implicit val ctx = ExecutionContext.global

  val client = new GuardianContentClient("test")

  private val clientHelper = CapiClientHelper(client)

  val query = CapiQueryGenerator(PathType.Search).showTags("all")
    .orderBy("newest")
    .pageSize(200)
    .tag("theguardian/mainsection/topstories")
    .fromDate(LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC))
    .toDate(LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC))
    .useDate("newspaper-edition")

  val response: List[SearchResponse] = clientHelper.readAllSearchResponsePages(query)

  client.shutdown()

  val ids = response.flatMap(res => {
    res.results.map(_.id)
  })

  println("RES ------------")

  ids.foreach(println(_))

}
