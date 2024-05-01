package services.editions.publishing

import com.gu.pandomainauth.model.User
import model.editions.{Edition, EditionsIssue, PublishAction, PublishableIssue}
import org.mockito.ArgumentMatchers.{any, eq}
import org.mockito.Mockito.{doNothing, never, times, verify, when}
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import services.editions.db.EditionsDB
import services.editions.publishing.transform.FeastAppModel.FeastAppCuration
import services.editions.publishing.PublishedIssueFormatters._

import java.time.LocalDate
import scala.util.{Failure, Try}

class PublishingTest extends FreeSpec with Matchers with MockitoSugar {
  "publishing.publish" - {
    "should send Feast editions to Feast publication backend" - {
      val editionsAppPublicationBucket = mock[PublicationTargetBase[PublishableIssue]]
      val editionsAppPreviewBucket = mock[PublicationTargetBase[PublishableIssue]]
      val feastAppPublicationTarget = mock[PublicationTargetBase[FeastAppCuration]]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)(any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing[PublishableIssue, FeastAppCuration](editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

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
        supportsProofing = false
      )
      toTest.publish(iss, User("Frank","Smith","fs@u.com", None), Publishing.ProofingNotRequiredMagicVersion)

      val expectedIssue = iss.toPublishableIssue("new-version", PublishAction.proof)

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(feastAppPublicationTarget, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))(any)
    }

    "should send Editorial editions to Editions publication backend" - {
      val editionsAppPublicationBucket = mock[PublicationTargetBase[PublishableIssue]]
      val editionsAppPreviewBucket = mock[PublicationTargetBase[PublishableIssue]]
      val feastAppPublicationTarget = mock[PublicationTargetBase[FeastAppCuration]]
      val db = mock[EditionsDB]

      doNothing().when(editionsAppPublicationBucket).putIssue(any,any)(any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing[PublishableIssue, FeastAppCuration](editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

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
        supportsProofing = false
      )
      toTest.publish(iss, User("Frank","Smith","fs@u.com", None), "some-version-id")

      val expectedIssue = iss.toPublishableIssue("some-version-id", PublishAction.publish)

      verify(editionsAppPublicationBucket, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))(any)
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[String])(any)
    }
  }

  "publishing.updatePreview" - {
    "should send Editorial editions to Editions preview backend" - {
      val editionsAppPublicationBucket = mock[PublicationTargetBase[PublishableIssue]]
      val editionsAppPreviewBucket = mock[PublicationTargetBase[PublishableIssue]]
      val feastAppPublicationTarget = mock[PublicationTargetBase[FeastAppCuration]]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)(any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing[PublishableIssue, FeastAppCuration](editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

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
        supportsProofing = false
      )
      toTest.updatePreview(iss)

      val expectedIssue = iss.toPreviewIssue

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(editionsAppPreviewBucket, times(1)).putIssue( org.mockito.ArgumentMatchers.eq(expectedIssue),org.mockito.ArgumentMatchers.eq(null))(any)
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[String])(any)
    }

    "should do nothing if you pass a Feast edition" - {
      val editionsAppPublicationBucket = mock[PublicationTargetBase[PublishableIssue]]
      val editionsAppPreviewBucket = mock[PublicationTargetBase[PublishableIssue]]
      val feastAppPublicationTarget = mock[PublicationTargetBase[FeastAppCuration]]
      val db = mock[EditionsDB]

      doNothing().when(feastAppPublicationTarget).putIssue(any,any)(any)
      when(db.createIssueVersion(any,any,any)).thenReturn("new-version")

      val toTest = new Publishing[PublishableIssue, FeastAppCuration](editionsAppPublicationBucket, editionsAppPreviewBucket, feastAppPublicationTarget, db)

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
        supportsProofing = false
      )
      val result = Try { toTest.updatePreview(iss) }

      assert(result.isSuccess)

      verify(editionsAppPublicationBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(editionsAppPreviewBucket, never()).putIssue(any[PublishableIssue],any[String])(any)
      verify(feastAppPublicationTarget, never()).putIssue(any[PublishableIssue],any[String])(any)
    }
  }
}
