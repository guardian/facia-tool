package services.editions

import java.time.LocalDate

import logging.Logging
import model.editions._
import play.api.mvc.{Result, Results}
import services.editions.prefills.PrefillHelper.defineContentQueryTimeWindow
import services.editions.prefills.{CapiQueryTimeWindow, Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.control.NonFatal

case class GenEditionTemplateResult(issueSkeleton: EditionsIssueSkeleton, contentPrefillTimeWindow: CapiQueryTimeWindow)

class EditionsTemplating(templates: PartialFunction[Edition, EditionTemplate], capi: Capi, ophan: Ophan) extends Logging {

  private val collectionsTemplating = CollectionTemplatingHelper(capi, ophan)

  def generateEditionTemplate(edition: Edition, issueDate: LocalDate): Either[Result, GenEditionTemplateResult] = {
    templates.lift(edition) match {
      case Some(editionTemplate) =>
        if (editionTemplate.availability.isValid(issueDate)) {
          import editionTemplate.{capiQueryPrefillParams, ophanQueryPrefillParams}

          val contentPrefillTimeWindow: CapiQueryTimeWindow = defineContentQueryTimeWindow(issueDate, capiQueryPrefillParams.timeWindowConfig)

          val frontsSkeleton = editionTemplate.fronts
            .filter(_._2.isValid(issueDate))
            .map { case (frontTemplate, _) =>

              val editionsCollectionSkeletons = collectionsTemplating.generateCollectionTemplates(
                frontTemplate.collections,
                edition,
                issueDate,
                editionTemplate,
                frontTemplate.maybeOphanPath,
                contentPrefillTimeWindow,
                ophanQueryPrefillParams)

              EditionsFrontSkeleton(
                frontTemplate.name,
                collections = editionsCollectionSkeletons,
                frontTemplate.presentation,
                frontTemplate.hidden,
                frontTemplate.isSpecial
              )
            }

          val issueSkeleton = EditionsIssueSkeleton(
            issueDate,
            editionTemplate.zoneId,
            frontsSkeleton
          )

          Right(GenEditionTemplateResult(issueSkeleton, contentPrefillTimeWindow))
        } else {
          Left(Results.UnprocessableEntity(s"$issueDate is not a valid date to create an issue of $edition"))
        }
      case None => Left(Results.NotFound(s"No editionTemplate registered for $edition"))
    }
  }


}

object CollectionTemplatingHelper {
  def apply(capi: Capi, ophan: Ophan): CollectionTemplatingHelper =
    new CollectionTemplatingHelper(capi, ophan)
}

class CollectionTemplatingHelper(capi: Capi, ophan: Ophan) extends Logging {

  def generateCollectionTemplates(collections: List[CollectionTemplate],
                                  edition: Edition,
                                  issueDate: LocalDate,
                                  template: EditionTemplate,
                                  maybeOphanPath: Option[String],
                                  contentPrefillTimeWindow: CapiQueryTimeWindow,
                                  ophanQueryPrefillParams: Option[OphanQueryPrefillParams]): List[EditionsCollectionSkeleton] = {
    collections.map { collection =>
      import collection.{hidden, name, prefill, presentation}
      EditionsCollectionSkeleton(
        name,
        items = prefill.map { contentPrefillUrlSegments =>
          val getPrefillParams = PrefillParamsAdapter(
            issueDate,
            contentPrefillUrlSegments,
            contentPrefillTimeWindow,
            maybeOphanPath,
            ophanQueryPrefillParams,
            edition
          )
          getPrefillArticles(getPrefillParams)
        }.getOrElse(Nil),
        prefill,
        presentation,
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
        10 seconds)
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
    // Sort by ophan score, descending, default zero, if and only if we got some scores
    // If there is no ophan url OR the request failed, fall back to ordering by newspaperPageNumber
    val sortedItems = maybeOphanScoresMap match {
      case Some(scoresMap) => items.sortBy(prefill => scoresMap.getOrElse(prefill.webUrl, 0d))(Ordering[Double].reverse)
      case _ => items.sortBy(prefill => prefill.newspaperPageNumber)
    }
    sortedItems
      .map { case Prefill(pageCode, _, _, metaData, cutoutImage, _, mediaType, pickedKicker) =>
        val articleMetadata = ArticleMetadata.default.copy(
          showByline = if (metaData.showByline) Some(true) else None,
          showQuotedHeadline = if (metaData.showQuotedHeadline) Some(true) else None,
          mediaType = mediaType,
          cutoutImage = cutoutImage,
          customKicker = pickedKicker
        )
        EditionsArticleSkeleton(pageCode.toString, articleMetadata)
      }
  }

}
