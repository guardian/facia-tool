package services.editions

import java.time.LocalDate

import logging.Logging
import model.editions._
import play.api.mvc.{Result, Results}
import services.editions.prefills.{CapiQueryTimeWindow, CapiPrefillTimeParams, MetadataForLogging, Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.control.NonFatal

case class GenerateEditionTemplateResult(issueSkeleton: EditionsIssueSkeleton, contentPrefillTimeWindow: CapiQueryTimeWindow)

class EditionsTemplating(templates: PartialFunction[Edition, EditionTemplate], capi: Capi, ophan: Ophan) extends Logging {

  private val collectionsTemplating = CollectionTemplatingHelper(capi, ophan)

  def generateEditionTemplate(edition: Edition, issueDate: LocalDate): Either[Result, GenerateEditionTemplateResult] = {
    templates.lift(edition) match {
      case Some(editionTemplate) =>
        if (editionTemplate.availability.isValid(issueDate)) {

          val issueSkeleton: EditionsIssueSkeleton = getIssueSkeleton(issueDate, editionTemplate, edition, editionTemplate.ophanQueryPrefillParams)
          val contentPrefillTimeWindow = editionTemplate.timeWindowConfig.toCapiQueryTimeWindow(issueDate)
          Right(GenerateEditionTemplateResult(issueSkeleton, contentPrefillTimeWindow))

        } else {

          Left(Results.UnprocessableEntity(s"$issueDate is not a valid date to create an issue of $edition"))

        }
      case None => Left(Results.NotFound(s"No editionTemplate registered for $edition"))
    }
  }

  private def getIssueSkeleton(issueDate: LocalDate, editionTemplate: EditionTemplate, edition: Edition, ophanQueryPrefillParams: Option[OphanQueryPrefillParams]) = {
    val frontsSkeleton = editionTemplate.fronts
      .filter{ case (_, period) => period.isValid(issueDate) }
      .map { case (frontTemplate, _) =>
        getFrontsSkeleton(issueDate, editionTemplate, edition, ophanQueryPrefillParams, frontTemplate)
      }

    EditionsIssueSkeleton(
      issueDate,
      editionTemplate.zoneId,
      frontsSkeleton
    )
  }

  private def getFrontsSkeleton(issueDate: LocalDate, editionTemplate: EditionTemplate, edition: Edition, ophanQueryPrefillParams: Option[OphanQueryPrefillParams], frontTemplate: FrontTemplate) = {
    val editionsCollectionSkeletons = collectionsTemplating.generateCollectionTemplates(
      frontTemplate,
      edition,
      issueDate,
      editionTemplate,
      ophanQueryPrefillParams)

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

  def generateCollectionTemplates(frontTemplate: FrontTemplate,
                                  edition: Edition,
                                  issueDate: LocalDate,
                                  editionTemplate: EditionTemplate,
                                  ophanQueryPrefillParams: Option[OphanQueryPrefillParams]): List[EditionsCollectionSkeleton] = {
    val collections = frontTemplate.collections
    val maybeOphanPath = frontTemplate.maybeOphanPath
    collections.map { collectionTemplate =>
      import collectionTemplate.{hidden, name, prefill, presentation}

      val timeWindowConfig = List(
        collectionTemplate.maybeTimeWindowConfig,
        frontTemplate.maybeTimeWindowConfig
      )
        .collectFirst{case Some(timeWindowConfig) => timeWindowConfig}
        .getOrElse(editionTemplate.timeWindowConfig)

      val capiQueryTimeWindow: CapiQueryTimeWindow = timeWindowConfig.toCapiQueryTimeWindow(issueDate)

      val capiPrefillTimeParams = CapiPrefillTimeParams(capiQueryTimeWindow, editionTemplate.capiDateQueryParam)

      EditionsCollectionSkeleton(
        name,
        prefill.map { contentPrefillUrlSegments =>
          val prefillParams = PrefillParamsAdapter(
            issueDate,
            contentPrefillUrlSegments,
            capiPrefillTimeParams,
            List(
              collectionTemplate.maybeOphanPath,
              maybeOphanPath,
              editionTemplate.maybeOphanPath
            ).collectFirst{case Some(path) => path},  // Get first non-None match,
            ophanQueryPrefillParams,
            edition,
            MetadataForLogging(issueDate, collectionId = None, collectionName = Some(name))
          )
          getPrefillArticles(prefillParams)
        }.getOrElse(Nil),
        prefill,
        presentation,
        capiQueryTimeWindow,
        hidden
      )
    }
  }


  // this function fetches articles from CAPI with enough data to resolve the defaults
  private def getPrefillArticles(prefillParams: PrefillParamsAdapter): List[EditionsArticleSkeleton] = {
    val maybeOphanScores = try {
      Await.result(
        ophan.getOphanScores(
          prefillParams.maybeOphanPath,
          prefillParams.issueDate,
          prefillParams.maybeOphanQueryPrefillParams),
        30 seconds)
    } catch {
      case NonFatal(t) =>
        // At least log this as a warning so we can trace frequency
        logger.warn(s"Failed to successfully fetch Ophan scores from ${prefillParams.maybeOphanPath}", t)
        None
    }
    val maybeOphanScoresMap = maybeOphanScores.map(os => os.toList.map(o => o.webUrl -> o.promotionScore).toMap)
    // TODO: This being a try will hide a litany of failures, some of which we might want to surface
    val items = try {
      Await.result(capi.getUnsortedPrefillArticleItems(prefillParams), 10 seconds)
    } catch {
      case NonFatal(t) =>
        // At least log this as a warning so we can trace frequency
        logger.warn(s"Failed to successfully execute CAPI prefill query $prefillParams", t)
        Nil
    }
    // If there is no ophan url OR the request failed, fall back to ordering by newspaperPageNumber
    // Otherwise, copy on the ophan score, then sort by it, descending, default zero
    val sortedItems: List[Prefill] = maybeOphanScoresMap match {
      case Some(scoresMap) => {
        items
          .map(item => item.copy(promotionMetric = scoresMap.get(item.webUrl)))
          .sortBy(item => item.newspaperPageNumber.getOrElse(999))
          .sortBy(item => item.promotionMetric.getOrElse(0d))(Ordering[Double].reverse)
      }
      case _ => items.sortBy(item => item.newspaperPageNumber.getOrElse(999))
    }
    sortedItems
      .map { case Prefill(pageCode, _, _, metaData, cutoutImage, _, mediaType, pickedKicker, promotionMetric) =>
        val articleMetadata = ArticleMetadata.default.copy(
          showByline = if (metaData.showByline) Some(true) else None,
          showQuotedHeadline = if (metaData.showQuotedHeadline) Some(true) else None,
          mediaType = mediaType,
          cutoutImage = cutoutImage,
          customKicker = pickedKicker,
          promotionMetric = promotionMetric
        )
        EditionsArticleSkeleton(pageCode.toString, articleMetadata)
      }
  }

}
