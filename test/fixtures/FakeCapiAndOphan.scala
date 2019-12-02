package fixtures

import java.time.LocalDate

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import model.editions.{Image, MediaType, OphanQueryPrefillParams}
import services.{Capi, Ophan, OphanScore}
import services.editions.prefills.{Prefill, PrefillParamsAdapter}

import scala.concurrent.Future

trait FakeCapiAndOphan {

  private val allFalseMetadata = ResolvedMetaData(false, false, false, false, false, false, false, false, false, false, false, false, false, false)

  private val imageUrl = "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif"

  val fakeCapi = new Capi {
    def getPreviewHeaders(headers: Map[String, String], url: String): Seq[(String, String)] = ???

    def getUnsortedPrefillArticleItems(prefillParams: PrefillParamsAdapter): List[Prefill] = {
      import prefillParams._
      capiPrefillQuery.queryString match {
        case "?tag=theguardian/mainsection/topstories" => List(
          Prefill(
            123456,
            None,
            "webUrl123456",
            allFalseMetadata.copy(
              showByline = false,
              showQuotedHeadline = false,
              imageCutoutReplace = false
            ),
            None,
            "tone1",
            None,
            None,
            None),
          Prefill(
            222222,
            None,
            "webUrl222222",
            allFalseMetadata.copy(
              showByline = false,
              showQuotedHeadline = false,
              imageCutoutReplace = false
            ),
            None,
            "tone2",
            None,
            None,
            None),
          Prefill(
            333333,
            None,
            "webUrl333333",
            allFalseMetadata.copy(
              showByline = false,
              showQuotedHeadline = false,
              imageCutoutReplace = false
            ),
            None,
            "tone3",
            None,
            None,
            None)
        )
        case "?tag=theguardian/g2/arts" => List(
          Prefill(
            345678,
            None,
            "webUrl345678",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            574893,
            None,
            "webUrl574893",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            None,
            "tone2",
            Some(MediaType.UseArticleTrail),
            None,
            None),
          Prefill(
            674893,
            None,
            "webUrl674893",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            None,
            "tone3",
            Some(MediaType.UseArticleTrail),
            None,
            None)
        )
        case "?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement" => List(
          Prefill(
            112211,
            None,
            "webUrl112211",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            122211,
            None,
            "webUrl122211",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            132211,
            None,
            "webUrl132211",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            142211,
            None,
            "webUrl142211",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            152211,
            None,
            "webUrl152211",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None)
        )
      }
    }

    def getPrefillArticles(prefillParams: PrefillParamsAdapter, currentPageCodes: List[String]): Future[SearchResponse] = ???
  }

  val nullOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(None)
  }

  val forwardOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(Some(
      Array(
        OphanScore("webUrl123456", 3d),
        OphanScore("webUrl345678", 2d),
        OphanScore("webUrl574893", 1d)
      )
    ))
  }

  val reverseOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(Some(
      Array(
        OphanScore("webUrl123456", 1d),
        OphanScore("webUrl345678", 2d),
        OphanScore("webUrl574893", 3d)
      )
    ))
  }

  val fakeOphan = new Ophan() {
    override def getOphanScores(maybePath: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] =
      Future.successful(Some(Array(OphanScore("banana", 33d))))
  }

}
