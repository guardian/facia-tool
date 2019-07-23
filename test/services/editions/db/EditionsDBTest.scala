package services.editions.db

import java.time._

import com.gu.pandomainauth.model.User
import fixtures.{EditionsDBService, UsesDatabase}
import model.editions._
import org.scalatest.{FreeSpec, Matchers, OptionValues}

class EditionsDBTest extends FreeSpec with Matchers with EditionsDBService with OptionValues {

  private val now: OffsetDateTime = OffsetDateTime.of(2019, 7, 16, 17, 23, 23, 0, ZoneOffset.ofHours(1))

  private val user: User = User("Billy", "Bragg", "billy.bragg@justice.example.com", None)

  private def insertSkeletonIssue(year: Int, month: Int, dom: Int, fronts: EditionsFrontSkeleton*): String = {
    val skeleton = EditionsIssueSkeleton(
      ZonedDateTime.of(year, month, dom, 0, 0, 0, 0, ZoneId.of("Europe/London")),
      ZoneId.of("Europe/London"),
      fronts.toList
    )
    editionsDB.insertIssue("daily-edition",
      skeleton,
      user,
      now
    )
  }

  private def front(name: String, collections: EditionsCollectionSkeleton*): EditionsFrontSkeleton =
    EditionsFrontSkeleton(name, collections.toList, FrontPresentation())

  private def collection(name: String, prefill: Option[CapiPrefillQuery], articles: String*): EditionsCollectionSkeleton =
    EditionsCollectionSkeleton(name, articles.toList, prefill, CollectionPresentation())

  "The editions DB" - {
    "should insert an empty issue" taggedAs UsesDatabase in {
      withEvolutions {
        val id = insertSkeletonIssue(2019, 9, 30)

        val retrievedIssue = editionsDB.getIssue(id).value
        retrievedIssue.displayName shouldBe "daily-edition"
        retrievedIssue.createdEmail shouldBe "billy.bragg@justice.example.com"
        retrievedIssue.createdOn shouldBe now.toInstant.toEpochMilli
        retrievedIssue.createdBy shouldBe "Billy Bragg"
        val issueDate = OffsetDateTime.ofInstant(Instant.ofEpochMilli(retrievedIssue.issueDate), ZoneId.of(retrievedIssue.timezoneId))
        issueDate.getDayOfWeek shouldBe DayOfWeek.MONDAY
        retrievedIssue.launchedOn.isDefined shouldBe false
        retrievedIssue.launchedBy.isDefined shouldBe false
        retrievedIssue.launchedEmail.isDefined shouldBe false
        retrievedIssue.fronts shouldBe Nil
      }
    }

    "should list issues" taggedAs UsesDatabase in {
      withEvolutions {
        insertSkeletonIssue(2019, 9, 28)
        insertSkeletonIssue(2019, 9, 29)
        insertSkeletonIssue(2019, 9, 30)
        insertSkeletonIssue(2019, 10, 10)

        val allIssues = editionsDB.listIssues("daily-edition", LocalDate.of(2019, 9, 28), LocalDate.of(2019, 10, 10))
        allIssues.length shouldBe 4
        allIssues.head.createdEmail shouldBe "billy.bragg@justice.example.com"

        val someIssues = editionsDB.listIssues("daily-edition", LocalDate.of(2019, 9, 28), LocalDate.of(2019, 10, 3))
        someIssues.length shouldBe 3
      }
    }

    "should insert fronts, collections and articles" taggedAs UsesDatabase in {
      withEvolutions {
        val id = insertSkeletonIssue(2019, 9, 30,
          front("news/uk",
            collection("politics", Some(CapiPrefillQuery("magic-politics-query")),"12345", "23456"),
            collection("international", None,"34567", "45678", "56789")
          ),
          front("comment",
            collection("opinion", Some(CapiPrefillQuery("magic-opinion-query")),"54321", "65432"),
            collection("brexshit", None,"76543", "87654"),
            collection("sigh", None,"98765", "09876")
          )
        )

        val retrievedIssue = editionsDB.getIssue(id).value
        retrievedIssue.displayName shouldBe "daily-edition"
        retrievedIssue.fronts.length shouldBe 2

        val newsFront = retrievedIssue.fronts.head
        newsFront.displayName shouldBe "news/uk"
        newsFront.collections.length shouldBe 2

        val newsPoliticsCollection = newsFront.collections.head
        newsPoliticsCollection.displayName shouldBe "politics"
        newsPoliticsCollection.prefill.value shouldBe CapiPrefillQuery("magic-politics-query")
        newsPoliticsCollection.items.length shouldBe 2

        val newsInternationalCollection = newsFront.collections.tail.head
        newsInternationalCollection.displayName shouldBe "international"
        newsInternationalCollection.prefill.isDefined shouldBe false
        newsInternationalCollection.items.length shouldBe 3

        val commentFront = retrievedIssue.fronts.tail.head
        commentFront.displayName shouldBe "comment"
        commentFront.collections.length shouldBe 3
      }
    }

    "should allow lookup of issue by collection id" taggedAs UsesDatabase in {
      withEvolutions {
        val id = insertSkeletonIssue(2019, 9, 30,
          front("news/uk",
            collection("politics", Some(CapiPrefillQuery("magic-politics-query")), "12345", "23456")
          )
        )
        insertSkeletonIssue(2019, 9, 29,
          front("news/uk",
            collection("politics", Some(CapiPrefillQuery("magic-politics-query")), "54321", "65432")
          )
        )
        insertSkeletonIssue(2019, 9, 28,
          front("news/uk",
            collection("politics", None, "14789", "32147")
          )
        )

        val retrievedIssue = editionsDB.getIssue(id).value
        val collectionsId = retrievedIssue.fronts.head.collections.head.id

        val maybeIssueId = editionsDB.getIssueIdFromCollectionId(collectionsId)
        maybeIssueId.value shouldBe id
      }
    }

  }

}
