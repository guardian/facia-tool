package services.editions

import java.time.LocalDate

import logging.Logging
import model.editions._
import play.api.mvc.{Result, Results}
import services.editions.prefills.{Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan, OphanScore}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.control.NonFatal

class EditionsTemplating(templates: PartialFunction[Edition, EditionTemplate], capi: Capi, ophan: Ophan) extends Logging {
  def generateEditionTemplate(edition: Edition, issueDate: LocalDate): Either[Result, EditionsIssueSkeleton] = {
    templates.lift(edition) match {
      case Some(template) =>
        if (template.availability.isValid(issueDate)) {
          Right(EditionsIssueSkeleton(
            issueDate,
            template.zoneId,
            template.fronts
              .filter(_._2.isValid(issueDate))
              .map { case (frontTemplate, _) =>
                EditionsFrontSkeleton(
                  frontTemplate.name,
                  frontTemplate.collections.map { collection =>
                    EditionsCollectionSkeleton(
                      collection.name,
                      collection.prefill.map { prefill =>
                        val prefillParams = PrefillParamsAdapter(issueDate, prefill, frontTemplate.ophanUrl, template.ophanRangeSearchDays, edition)
                        getPrefillArticles(prefillParams)
                      }.getOrElse(Nil),
                      collection.prefill,
                      collection.presentation,
                      collection.hidden
                    )
                  },
                  frontTemplate.presentation,
                  frontTemplate.hidden,
                  frontTemplate.isSpecial
                )
              }))
        } else {
          Left(Results.UnprocessableEntity(s"$issueDate is not a valid date to create an issue of $edition"))
        }
      case None => Left(Results.NotFound(s"No template registered for $edition"))
    }
  }

  // this function fetches articles from CAPI with enough data to resolve the defaults
  private def getPrefillArticles(prefillParams: PrefillParamsAdapter): List[EditionsArticleSkeleton] = {
    val maybeOphanScores = try {
      val fromDate = prefillParams.issueDate.minusDays(prefillParams.range)
      Await.result(ophan.getOphanScores(prefillParams.maybeOphanUrl, fromDate, prefillParams.issueDate), 10 seconds)
    } catch {
      case NonFatal(t) =>
        // At least log this as a warning so we can trace frequency
        logger.warn(s"Failed to successfully fetch Ophan scores from ${prefillParams.maybeOphanUrl}", t)
        None
    }
    val maybeOphanScoresMap = maybeOphanScores.map( os => os.toList.map(o => o.webUrl -> o.promotionScore).toMap)
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
