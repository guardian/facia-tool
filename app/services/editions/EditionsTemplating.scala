package services.editions

import logging.Logging
import model.editions._
import model.editions.templates.{CuratedPlatformDefinition, TemplatedPlatform}
import play.api.mvc.{Result, Results}
import services.editions.prefills._
import services.{Capi, Ophan}

import java.time.LocalDate
import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.control.NonFatal

case class GenerateEditionTemplateResult(
    issueSkeleton: EditionsIssueSkeleton,
    contentPrefillTimeWindow: CapiQueryTimeWindow
)

class EditionsTemplating(
    templates: Map[Edition, CuratedPlatformDefinition with TemplatedPlatform],
    capi: Capi,
    ophan: Ophan
) extends Logging {

  private val collectionsTemplating = CollectionTemplatingHelper(capi, ophan)

  def generateEditionTemplate(
      edition: Edition,
      issueDate: LocalDate
  ): Either[Result, GenerateEditionTemplateResult] = {
    templates.get(edition) match {
      case Some(editionDefinition) =>
        if (editionDefinition.template.availability.isValid(issueDate)) {

          val issueSkeleton: EditionsIssueSkeleton = getIssueSkeleton(
            issueDate,
            editionDefinition.template,
            edition,
            editionDefinition.template.ophanQueryPrefillParams
          )
          val contentPrefillTimeWindow =
            editionDefinition.template.timeWindowConfig.toCapiQueryTimeWindow(
              issueDate
            )
          Right(
            GenerateEditionTemplateResult(
              issueSkeleton,
              contentPrefillTimeWindow
            )
          )

        } else {

          Left(
            Results.UnprocessableEntity(
              s"$issueDate is not a valid date to create an issue of $edition"
            )
          )

        }
      case None =>
        Left(Results.NotFound(s"No editionTemplate registered for $edition"))
    }
  }

  private def getIssueSkeleton(
      issueDate: LocalDate,
      editionTemplate: EditionTemplate,
      edition: Edition,
      ophanQueryPrefillParams: Option[OphanQueryPrefillParams]
  ) = {
    val frontsSkeleton = editionTemplate.fronts
      .filter { case (_, period) => period.isValid(issueDate) }
      .map { case (frontTemplate, _) =>
        getFrontsSkeleton(
          issueDate,
          editionTemplate,
          edition,
          ophanQueryPrefillParams,
          frontTemplate
        )
      }

    EditionsIssueSkeleton(
      issueDate,
      editionTemplate.zoneId,
      frontsSkeleton
    )
  }

  private def getFrontsSkeleton(
      issueDate: LocalDate,
      editionTemplate: EditionTemplate,
      edition: Edition,
      ophanQueryPrefillParams: Option[OphanQueryPrefillParams],
      frontTemplate: FrontTemplate
  ) = {
    val editionsCollectionSkeletons =
      collectionsTemplating.generateCollectionTemplates(
        frontTemplate,
        edition,
        issueDate,
        editionTemplate,
        ophanQueryPrefillParams
      )

    EditionsFrontSkeleton(
      frontTemplate.name,
      collections = editionsCollectionSkeletons,
      frontTemplate.presentation,
      frontTemplate.hidden,
      frontTemplate.isSpecial
    )
  }
}

object CollectionTemplatingHelper {
  def apply(capi: Capi, ophan: Ophan): CollectionTemplatingHelper =
    new CollectionTemplatingHelper(capi, ophan)
}

class CollectionTemplatingHelper(capi: Capi, ophan: Ophan) extends Logging {

  def generateCollectionTemplates(
      frontTemplate: FrontTemplate,
      edition: Edition,
      issueDate: LocalDate,
      editionTemplate: EditionTemplate,
      ophanQueryPrefillParams: Option[OphanQueryPrefillParams]
  ): List[EditionsCollectionSkeleton] = {
    val collections = frontTemplate.collections
    val maybeOphanPath = frontTemplate.maybeOphanPath
    collections.map { collectionTemplate =>
      import collectionTemplate.{hidden, name, prefill}

      val timeWindowConfig = List(
        collectionTemplate.maybeTimeWindowConfig,
        frontTemplate.maybeTimeWindowConfig
      )
        .collectFirst { case Some(timeWindowConfig) => timeWindowConfig }
        .getOrElse(editionTemplate.timeWindowConfig)

      val capiQueryTimeWindow: CapiQueryTimeWindow =
        timeWindowConfig.toCapiQueryTimeWindow(issueDate)

      val capiPrefillTimeParams = CapiPrefillTimeParams(
        capiQueryTimeWindow,
        editionTemplate.capiDateQueryParam
      )

      EditionsCollectionSkeleton(
        name,
        prefill
          .map { contentPrefillUrlSegments =>
            val prefillParams = PrefillParamsAdapter(
              issueDate,
              contentPrefillUrlSegments,
              capiPrefillTimeParams,
              List(
                collectionTemplate.maybeOphanPath,
                maybeOphanPath,
                editionTemplate.maybeOphanPath
              ).collectFirst { case Some(path) =>
                path
              }, // Get first non-None match,
              ophanQueryPrefillParams,
              edition,
              Some(collectionTemplate.cardCap),
              MetadataForLogging(
                issueDate,
                collectionId = None,
                collectionName = Some(name)
              )
            )
            getPrefillArticles(prefillParams)
          }
          .getOrElse(Nil),
        prefill,
        capiQueryTimeWindow,
        hidden
      )
    }
  }

  // this function fetches articles from CAPI with enough data to resolve the defaults
  private def getPrefillArticles(
      prefillParams: PrefillParamsAdapter
  ): List[EditionsCardSkeleton] = {

    val maybeOphanScoresMap: Option[Map[String, Double]] = getOphanMetricsMap(
      prefillParams
    )

    val items = getArticleItemsFromCapi(prefillParams)

    val sortedArticleItems: List[Prefill] =
      sortArticleItems(items, maybeOphanScoresMap)

    val cappedItems = capArticleItems(sortedArticleItems, prefillParams)

    mapToSkeleton(cappedItems)
  }

  private def mapToSkeleton(
      sortedArticleItems: List[Prefill]
  ): List[EditionsCardSkeleton] = {
    sortedArticleItems
      .map {
        case Prefill(
              pageCode,
              _,
              _,
              metaData,
              cutoutImage,
              _,
              mediaType,
              pickedKicker,
              promotionMetric,
              _
            ) =>
          val cardMetadata = EditionsArticleMetadata.default.copy(
            showByline = if (metaData.showByline) Some(true) else None,
            showQuotedHeadline =
              if (metaData.showQuotedHeadline) Some(true) else None,
            mediaType = mediaType,
            cutoutImage = cutoutImage,
            customKicker = pickedKicker,
            promotionMetric = promotionMetric
          )
          EditionsCardSkeleton(
            pageCode.toString,
            CardType.Article,
            Some(cardMetadata)
          )
      }
  }

  private def getArticleItemsFromCapi(
      prefillParams: PrefillParamsAdapter
  ): List[Prefill] = {
    // TODO: This being a try will hide a litany of failures, some of which we might want to surface
    try {
      capi.getUnsortedPrefillArticleItems(prefillParams)
    } catch {
      case NonFatal(t) =>
        // At least log this as a warning so we can trace frequency
        logger.warn(
          s"Failed to successfully execute CAPI prefill query $prefillParams",
          t
        )
        Nil
    }
  }

  private def getOphanMetricsMap(
      prefillParams: PrefillParamsAdapter
  ): Option[Map[String, Double]] = {
    val maybeOphanScores =
      try {
        Await.result(
          ophan.getOphanScores(
            prefillParams.maybeOphanPath,
            prefillParams.issueDate,
            prefillParams.maybeOphanQueryPrefillParams
          ),
          30 seconds
        )
      } catch {
        case NonFatal(t) =>
          // At least log this as a warning so we can trace frequency
          logger.warn(
            s"Failed to successfully fetch Ophan scores from ${prefillParams.maybeOphanPath}",
            t
          )
          None
      }
    maybeOphanScores.map(os =>
      os.toList.map(o => o.capiId -> o.promotionScore).toMap
    )
  }

  protected[editions] def sortArticleItems(
      articleItems: List[Prefill],
      maybeOphanScoresMap: Option[Map[String, Double]]
  ): List[Prefill] = {
    // If there are no ophan scores OR the request failed, fall back to ordering by newspaperPageNumber
    // Otherwise, copy on the ophan score, then sort by it, descending, default zero
    maybeOphanScoresMap match {
      case Some(scoresMap) =>
        articleItems
          .map(item => item.copy(promotionMetric = scoresMap.get(item.capiId)))
          .sortBy(item => item.newspaperPageNumber.getOrElse(999))
          .sortBy(item => item.promotionMetric.getOrElse(0d))(
            Ordering[Double].reverse
          )
      case _ =>
        articleItems.sortBy(item => item.newspaperPageNumber.getOrElse(999))
    }
  }

  private def capArticleItems(
      sortedArticleItems: List[Prefill],
      prefillParams: PrefillParamsAdapter
  ): List[Prefill] = {
    prefillParams.maybePrefillItemsCap match {
      case Some(cap) => sortedArticleItems.take(cap)
      case _         => sortedArticleItems
    }
  }

}
