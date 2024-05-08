package services.editions.publishing

import com.gu.pandomainauth.model.User
import model.editions.{Edition, EditionsIssue, PublishAction, PublishableIssue}
import org.mockito.ArgumentMatchers.{any, eq}
import org.mockito.Mockito.{doNothing, never, times, verify, when}
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import services.editions.db.EditionsDB
import model.FeastAppModel.FeastAppCuration
import services.editions.publishing.PublishedIssueFormatters._

import java.time.LocalDate
import scala.util.{Failure, Try}
import model.editions.CuratedPlatform

class PublishingTest extends FreeSpec with Matchers with MockitoSugar {
  "publishing.publish" - {
    "should send Feast editions to Feast publication backend" - {
      val editionsAppPublicationBucket = mock[EditionsBucket]
      val editionsAppPreviewBucket = mock[EditionsBucket]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing(editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

      val iss = EditionsIssue(
        "fake-id",
        Edition.FeastSouthernHemisphere,
        timezoneId = "UTC",
        issueDate = LocalDate.now(),
        createdOn = 12345678L,
        createdBy = "Jo Bloggs",
        createdEmail = "j.b@emailme.com",
        launchedOn = None,
        launchedBy = None,
        launchedEmail = None,
        fronts = List(),
        supportsProofing = false,
        platform = CuratedPlatform.Feast
      )
      toTest.publish(iss, User("Frank","Smith","fs@u.com", None),"no-proof-needed")

      val expectedIssue = iss.toPublishableIssue("new-version", PublishAction.proof)

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(feastAppPublicationTarget, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))
    }

    "should send Editorial editions to Editions publication backend" - {
      val editionsAppPublicationBucket = mock[EditionsBucket]
      val editionsAppPreviewBucket = mock[EditionsBucket]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      doNothing().when(editionsAppPublicationBucket).putIssue(any,any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing(editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

      val iss = EditionsIssue(
        "fake-id",
        Edition.TrainingEdition,
        timezoneId = "UTC",
        issueDate = LocalDate.now(),
        createdOn = 12345678L,
        createdBy = "Jo Bloggs",
        createdEmail = "j.b@emailme.com",
        launchedOn = None,
        launchedBy = None,
        launchedEmail = None,
        fronts = List(),
        supportsProofing = true,
        platform = CuratedPlatform.Editions
      )
      toTest.publish(iss, User("Frank","Smith","fs@u.com", None), "some-version-id")

      val expectedIssue = iss.toPublishableIssue("some-version-id", PublishAction.publish)

      verify(editionsAppPublicationBucket, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[Option[String]])
    }
  }

  "publishing.updatePreview" - {
    "should send Editorial editions to Editions preview backend" - {
      val editionsAppPublicationBucket = mock[EditionsBucket]
      val editionsAppPreviewBucket = mock[EditionsBucket]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing(editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

      val iss = EditionsIssue(
        "fake-id",
        Edition.TrainingEdition,
        timezoneId = "UTC",
        issueDate = LocalDate.now(),
        createdOn = 12345678L,
        createdBy = "Jo Bloggs",
        createdEmail = "j.b@emailme.com",
        launchedOn = None,
        launchedBy = None,
        launchedEmail = None,
        fronts = List(),
        supportsProofing = false,
        platform = CuratedPlatform.Editions
      )
      toTest.updatePreview(iss)

      val expectedIssue = iss.toPreviewIssue

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(editionsAppPreviewBucket, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[Option[String]])
    }

    "should do nothing if you pass a Feast edition" - {
      val editionsAppPublicationBucket = mock[EditionsBucket]
      val editionsAppPreviewBucket = mock[EditionsBucket]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing(editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

      val iss = EditionsIssue(
        "fake-id",
        Edition.FeastNorthernHemisphere,
        timezoneId = "UTC",
        issueDate = LocalDate.now(),
        createdOn = 12345678L,
        createdBy = "Jo Bloggs",
        createdEmail = "j.b@emailme.com",
        launchedOn = None,
        launchedBy = None,
        launchedEmail = None,
        fronts = List(),
        supportsProofing = false,
        platform = CuratedPlatform.Feast
      )
      val result = Try { toTest.updatePreview(iss) }

      assert(result.isSuccess)

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[Option[String]])
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[Option[String]])
    }
  }
}
