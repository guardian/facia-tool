package fixtures

import java.time.LocalDate

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import model.editions.{Image, MediaType, OphanQueryPrefillParams}
import services.{Capi, Ophan, OphanScore}
import services.editions.prefills.{Prefill, PrefillParamsAdapter}

import scala.concurrent.Future

trait FakeCapiAndOphan {

  private val allFalseMetadata = ResolvedMetaData(
    false,
    false,
    "boostLevel.default",
		false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  )

  private val imageUrl =
    "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif"

  val fakeCapi = new Capi {
    def getPreviewHeaders(
        headers: Map[String, String],
        url: String
    ): Seq[(String, String)] = ???

    def getUnsortedPrefillArticleItems(
        prefillParams: PrefillParamsAdapter
    ): List[Prefill] = {
      import prefillParams._
      capiPrefillQuery.queryString match {
        case "?tag=theguardian/mainsection/topstories" =>
          List(
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
              None,
              "capiId123456"
            ),
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
              None,
              "capiId222222"
            ),
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
              None,
              "capiId333333"
            )
          )
        case "?tag=theguardian/g2/arts" =>
          List(
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
              None,
              "capiId345678"
            ),
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
              None,
              "capiId574893"
            ),
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
              None,
              "capiId674893"
            )
          )
        case "?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement" =>
          List(
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
              None,
              "capiId112211"
            ),
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
              None,
              "capiId122211"
            ),
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
              None,
              "capiId132211"
            ),
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
              None,
              "capiId132211"
            ),
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
              None,
              "capiId132211"
            )
          )
      }
    }

    def getPrefillArticles(
        prefillParams: PrefillParamsAdapter,
        currentPageCodes: List[String]
    ): List[SearchResponse] = ???
  }

  val nullOphan = new Ophan {
    override def getOphanScores(
        maybeUrl: Option[String],
        baseDate: LocalDate,
        maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
    ): Future[Option[Array[OphanScore]]] = Future.successful(None)
  }

  val forwardOphan = new Ophan {
    override def getOphanScores(
        maybeUrl: Option[String],
        baseDate: LocalDate,
        maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
    ): Future[Option[Array[OphanScore]]] = Future.successful(
      Some(
        Array(
          OphanScore("capiId123456", 3d),
          OphanScore("capiId345678", 2d),
          OphanScore("capiId574893", 1d)
        )
      )
    )
  }

  val reverseOphan = new Ophan {
    override def getOphanScores(
        maybeUrl: Option[String],
        baseDate: LocalDate,
        maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
    ): Future[Option[Array[OphanScore]]] = Future.successful(
      Some(
        Array(
          OphanScore("capiId123456", 1d),
          OphanScore("capiId345678", 2d),
          OphanScore("capiId574893", 3d)
        )
      )
    )
  }

  val fakeOphan = new Ophan() {
    override def getOphanScores(
        maybePath: Option[String],
        baseDate: LocalDate,
        maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
    ): Future[Option[Array[OphanScore]]] =
      Future.successful(Some(Array(OphanScore("banana", 33d))))
  }

}
