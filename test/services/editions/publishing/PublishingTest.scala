package services.editions.publishing

import com.gu.pandomainauth.model.User
import model.editions.{Edition, EditionsIssue, PublishAction}
import org.mockito.ArgumentMatchers.{any, eq => mockEq}
import org.mockito.Mockito.{doNothing, never, times, verify, when}
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import services.editions.db.EditionsDB

import java.time.LocalDate
import scala.util.Try
import model.editions.CuratedPlatform
import model.editions.PublishAction.PublishAction

class PublishingTest extends FreeSpec with Matchers with MockitoSugar {
  "publishing.publish" - {
    "should send Feast editions to Feast publication backend" - {
      val editionsAppPublicationBucket = mock[EditionsAppPublicationTarget]
      val editionsAppPreviewBucket = mock[EditionsAppPublicationTarget]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      when(db.createIssueVersion(any, any, any)).thenReturn("new-version")

      val toTest = new Publishing(
        editionsAppPublicationBucket,
        editionsAppPreviewBucket,
        feastAppPublicationTarget,
        db
      )

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
      toTest.publish(
        iss,
        User("Frank", "Smith", "fs@u.com", None),
        "no-proof-needed"
      )

      verify(editionsAppPublicationBucket, never()).putIssue(
        any[EditionsIssue],
        any[String],
        mockEq(PublishAction.proof)
      )
      verify(editionsAppPreviewBucket, never()).putIssue(
        any[EditionsIssue],
        any[String],
        mockEq(PublishAction.preview)
      )
      verify(feastAppPublicationTarget, times(1)).putIssue(
        mockEq(iss),
        mockEq("new-version"),
        mockEq(PublishAction.proof)
      )
    }

    "should send Editorial editions to Editions publication backend" - {
      val editionsAppPublicationBucket = mock[EditionsAppPublicationTarget]
      val editionsAppPreviewBucket = mock[EditionsAppPublicationTarget]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      when(db.createIssueVersion(any, any, any)).thenReturn("new-version")

      val toTest = new Publishing(
        editionsAppPublicationBucket,
        editionsAppPreviewBucket,
        feastAppPublicationTarget,
        db
      )

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
      toTest.publish(
        iss,
        User("Frank", "Smith", "fs@u.com", None),
        "some-version-id"
      )

      verify(editionsAppPublicationBucket, times(1)).putIssue(
        mockEq(iss),
        mockEq("some-version-id"),
        mockEq(PublishAction.publish)
      )
      verify(editionsAppPreviewBucket, never()).putIssue(
        any[EditionsIssue],
        mockEq("some-version-id"),
        any[PublishAction]
      )
      verify(feastAppPublicationTarget, never()).putIssue(
        any[EditionsIssue],
        mockEq("some-version-id"),
        any[PublishAction]
      )
    }
  }

  "publishing.updatePreview" - {
    "should send Editorial editions to Editions preview backend" - {
      val editionsAppPublicationBucket = mock[EditionsAppPublicationTarget]
      val editionsAppPreviewBucket = mock[EditionsAppPublicationTarget]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      when(db.createIssueVersion(any, any, any)).thenReturn("new-version")

      val toTest = new Publishing(
        editionsAppPublicationBucket,
        editionsAppPreviewBucket,
        feastAppPublicationTarget,
        db
      )

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

      verify(editionsAppPublicationBucket, never()).putIssue(
        any[EditionsIssue],
        any[String],
        any[PublishAction]
      )
      verify(editionsAppPreviewBucket, times(1)).putIssue(
        mockEq(iss),
        mockEq("preview"),
        any[PublishAction]
      )
      verify(feastAppPublicationTarget, never()).putIssue(
        any[EditionsIssue],
        any[String],
        any[PublishAction]
      )
    }

    "should do nothing if you pass a Feast edition" - {
      val editionsAppPublicationBucket = mock[EditionsAppPublicationTarget]
      val editionsAppPreviewBucket = mock[EditionsAppPublicationTarget]
      val feastAppPublicationTarget = mock[FeastPublicationTarget]
      val db = mock[EditionsDB]

      when(db.createIssueVersion(any, any, any)).thenReturn("new-version")

      val toTest = new Publishing(
        editionsAppPublicationBucket,
        editionsAppPreviewBucket,
        feastAppPublicationTarget,
        db
      )

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

      verify(editionsAppPublicationBucket, never()).putIssue(
        any[EditionsIssue],
        any[String],
        any[PublishAction]
      )
      verify(editionsAppPreviewBucket, never()).putIssue(
        any[EditionsIssue],
        any[String],
        any[PublishAction]
      )
      verify(feastAppPublicationTarget, never()).putIssue(
        any[EditionsIssue],
        any[String],
        any[PublishAction]
      )
    }
  }
}
