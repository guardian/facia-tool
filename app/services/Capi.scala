package services

import java.io.IOException
import java.net.URI
import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{
  AWSCredentialsProviderChain,
  STSAssumeRoleSessionCredentialsProvider
}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import com.gu.contentapi.client.{GuardianContentClient, IAMSigner, Parameter}
import conf.ApplicationConfiguration
import logging.Logging
import logic.CapiPrefiller
import model.editions._
import okhttp3.{Call, Callback, Request, Response}
import org.apache.http.client.utils.URLEncodedUtils
import services.editions.prefills.{Prefill, PrefillParamsAdapter}

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future, Promise}

object GuardianCapiDefaults {
  // 200 is max value in CAPI
  val MaxPageSize: Int = 200
}

class GuardianCapi(config: ApplicationConfiguration)(implicit
    ex: ExecutionContext
) extends GuardianContentClient(apiKey = config.contentApi.editionsKey)
    with Capi
    with Logging {

  override def targetUrl: String = config.contentApi.contentApiDraftHost

  override def get(url: String, headers: Map[String, String])(implicit
      context: ExecutionContext
  ): Future[HttpResponse] = {
    val reqBuilder =
      getPreviewHeaders(headers, url).foldLeft(new Request.Builder().url(url)) {
        case (builder, headerPair) =>
          val (headerName, headerValue) = headerPair
          builder.addHeader(headerName, headerValue)
      }

    val promise = Promise[HttpResponse]()

    http
      .newCall(reqBuilder.build())
      .enqueue(new Callback() {
        override def onFailure(call: Call, e: IOException): Unit =
          promise.failure(e)

        override def onResponse(call: Call, response: Response): Unit = {
          promise.success(
            HttpResponse(
              response.body().bytes,
              response.code(),
              response.message()
            )
          )
        }
      })
    promise.future
  }

  private val previewSigner = {
    val capiPreviewCredentials = new AWSCredentialsProviderChain(
      new ProfileCredentialsProvider("capi"),
      new STSAssumeRoleSessionCredentialsProvider.Builder(
        config.contentApi.previewRole,
        "capi"
      ).build()
    )
    new IAMSigner(
      credentialsProvider = capiPreviewCredentials,
      awsRegion = config.aws.region
    )
  }

  def getPreviewHeaders(
      headers: Map[String, String],
      url: String
  ): Seq[(String, String)] =
    previewSigner.addIAMHeaders(headers = headers, URI.create(url)).toSeq

  // Sadly there's no easy way of converting a CAPI client response into JSON so we'll just proxy - similar to controllers.FaciaContentApiProxy
  // this function is used for (suggest articles for collection) functionality
  def getPrefillArticles(
      getPrefill: PrefillParamsAdapter,
      currentPageCodes: List[String]
  ): List[SearchResponse] = {
    val query =
      GuardianCapi.prepareGetPrefillArticlesQuery(getPrefill, currentPageCodes)

    logger.info(
      s"getPrefillArticles, Prefill Query: $query for ${getPrefill.metadataForLogging}"
    )

    val getResponseFunction = (query: CapiQueryGenerator) =>
      this.getResponse(query)
    val allResponses =
      GuardianCapi.readAllSearchResponsePages(query, getResponseFunction)
    withResultsThatNotContainCurrentPageCodes(allResponses, currentPageCodes)
  }

  private def withResultsThatNotContainCurrentPageCodes(
      responses: List[SearchResponse],
      currentPageCodes: List[String]
  ) = {
    val filterByPageCodes = (content: Content) => {
      (for {
        fields <- content.fields
        pageCode <- fields.internalPageCode
      } yield !currentPageCodes.contains(pageCode.toString))
        .getOrElse(true)
    }
    responses.map(response => {
      val filteredResults = response.results.filter(filterByPageCodes)
      response.copy(
        total = filteredResults.length,
        results = filteredResults
      )
    })
  }

  /** Get a list of article items in the order they exist according to the
    * newspaper page number
    *
    * @param getPrefillParams
    * @return
    */
  def getUnsortedPrefillArticleItems(
      getPrefillParams: PrefillParamsAdapter
  ): List[Prefill] = {

    val query: CapiQueryGenerator =
      GuardianCapi.prepareGetUnsortedPrefillArticleItemsQuery(getPrefillParams)

    logger.info(
      s"getUnsortedPrefillArticleItems, Prefill Query: $query for ${getPrefillParams.metadataForLogging}"
    )

    val getResponseFunction = (query: CapiQueryGenerator) =>
      this.getResponse(query)
    logger.info(s"query => ${query.getUrl(targetUrl)}")

    val searchResponsePages =
      GuardianCapi.readAllSearchResponsePages(query, getResponseFunction)

    searchResponsePages.flatMap(mapToPrefill)
  }

  private def mapToPrefill(response: SearchResponse): List[Prefill] =
    response.results.flatMap(content => prefillMetadata(content)).toList

  private def prefillMetadata(content: Content): Option[Prefill] =
    content.fields.flatMap(_.internalPageCode).map { internalPageCode =>
      CapiPrefiller.prefill(content)
    }
}

object GuardianCapi extends Logging {

  import scala.jdk.CollectionConverters._

  def prepareGetUnsortedPrefillArticleItemsQuery(
      getPrefillParams: PrefillParamsAdapter
  ): CapiQueryGenerator = {
    val fields = List(
      "newspaperEditionDate",
      "newspaperPageNumber",
      "internalPageCode"
    )

    geneneratePrefillQuery(getPrefillParams, fields).showTags("all")
  }

  def prepareGetPrefillArticlesQuery(
      getPrefill: PrefillParamsAdapter,
      currentPageCodes: List[String]
  ): CapiQueryGenerator = {

    val fields = List(
      "newspaperEditionDate",
      "newspaperPageNumber",
      "internalPageCode",
      "isLive",
      "firstPublicationDate",
      "headline",
      "trailText",
      "byline",
      "thumbnail",
      "secureThumbnail",
      "liveBloggingNow",
      "membershipAccess",
      "shortUrl"
    )

    geneneratePrefillQuery(getPrefill, fields)
      .showElements("images")
      .showTags("all")
      .showBlocks("main")
      .showAtoms("media")
  }

  private def geneneratePrefillQuery(
      getPrefillParams: PrefillParamsAdapter,
      fields: List[String]
  ): CapiQueryGenerator = {

    import getPrefillParams._

    val params = URLEncodedUtils
      .parse(
        new URI(capiPrefillQuery.escapedQueryString()),
        Charset.forName("UTF-8")
      )
      .asScala

    import capiPrefillTimeParams.{capiDateQueryParam, capiQueryTimeWindow}
    import capiQueryTimeWindow.{fromDate, toDate}

    var query = CapiQueryGenerator(capiPrefillQuery.pathType)
      .pageSize(GuardianCapiDefaults.MaxPageSize)
      .showFields(fields.mkString(","))
      .useDate(capiDateQueryParam.entryName)
      .orderBy("newest")
      .fromDate(fromDate)
      .toDate(toDate)

    params.filter(pair => pair.getName == "section").foreach { sectionPair =>
      query = query.section(sectionPair.getValue)
    }

    params.filter(pair => pair.getName == "tag").foreach { tagPair =>
      query = query.tag(tagPair.getValue)
    }

    params.find(pair => pair.getName == "q").foreach { queryPair =>
      query = query.q(queryPair.getValue)
    }
    query
  }

  private[services] def readAllSearchResponsePages(
      query: CapiQueryGenerator,
      getResponse: CapiQueryGenerator => Future[SearchResponse]
  )(implicit ex: ExecutionContext): List[SearchResponse] = {

    // Capi Scala client have functions that reads paginated responses
    // but they give inaccurate results (most of the time it gives only the first page)
    // TODO investigate that
    //
    //  val paginateFoldRes = client.paginateFold(query)(Seq(): Seq[SearchResponse]) {
    //    (response: SearchResponse, acc: Seq[SearchResponse]) => acc :+ response
    //  }
    //
    //  val response: List[SearchResponse] = Await.result(paginateFoldRes, Duration.Inf).toList

    val FirstPageReqTimeout = Duration(3, TimeUnit.SECONDS)
    val firstPageResponse =
      Await.result(getResponse(query.page(1)), FirstPageReqTimeout)
    val totalPages = firstPageResponse.pages

    val allResponsePages =
      if (totalPages == 0 || totalPages == 1) List(firstPageResponse)
      else {
        val remainingPages = readRemainingPages(totalPages, query, getResponse)
        firstPageResponse +: remainingPages
      }
    logger.info(
      s"readAllSearchResponsePages, fetched CAPI search Response pages count ${allResponsePages.size}"
    )
    allResponsePages
  }

  private def readRemainingPages(
      totalPages: Int,
      query: CapiQueryGenerator,
      getResponse: CapiQueryGenerator => Future[SearchResponse]
  )(implicit ex: ExecutionContext): List[SearchResponse] = {
    val RemainingPagesReqTimeout = Duration(5, TimeUnit.SECONDS)
    val remainingPages = (1 to totalPages).tail
    val restFutures: List[Future[SearchResponse]] =
      (for (nextPageNum <- remainingPages)
        yield getResponse(query.page(nextPageNum))).toList
    Await.result(Future.sequence(restFutures), RemainingPagesReqTimeout)
  }
}

case class CapiQueryGenerator(
    pathType: PathType,
    parameterHolder: Map[String, Parameter] = Map.empty
) extends SearchQueryBase[CapiQueryGenerator] {

  def withParameters(parameterMap: Map[String, Parameter]) =
    copy(pathType, parameterMap)

  override def pathSegment: String = pathType.toPathSegment
}

trait Capi {
  def getPreviewHeaders(
      headers: Map[String, String],
      url: String
  ): Seq[(String, String)]

  def getUnsortedPrefillArticleItems(
      prefillParams: PrefillParamsAdapter
  ): List[Prefill]

  def getPrefillArticles(
      prefillParams: PrefillParamsAdapter,
      currentPageCodes: List[String]
  ): List[SearchResponse]
}
