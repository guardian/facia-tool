package services.editions.db

import java.time._

import com.gu.pandomainauth.model.User
import fixtures.{EditionsDBService, UsesDatabase}
import model.editions._
import org.scalatest.{FreeSpec, Matchers, OptionValues}

class EditionsDBTest extends FreeSpec with Matchers with EditionsDBService with OptionValues {

  "The editions DB" - {
    "should insert an empty issue" taggedAs UsesDatabase in {
      withEvolutions {
        val skeleton = EditionsIssueSkeleton(
          ZonedDateTime.of(2019, 9, 30, 0, 0, 0, 0, ZoneId.of("Europe/London")),
          ZoneId.of("Europe/London"),
          Nil
        )
        val now = OffsetDateTime.of(2019, 7, 16, 17, 23, 23, 0, ZoneOffset.ofHours(1))
        val id = editionsDB.insertIssue("daily-edition",
          skeleton,
          User("Billy", "Bragg", "billy.bragg@justice.example.com", None),
          now
        )

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
        val now = OffsetDateTime.of(2019, 7, 16, 17, 23, 23, 0, ZoneOffset.ofHours(1))
        def skeleton(year: Int, month: Int, dom: Int): EditionsIssueSkeleton = {
          EditionsIssueSkeleton(
            ZonedDateTime.of(year, month, dom, 0, 0, 0, 0, ZoneId.of("Europe/London")),
            ZoneId.of("Europe/London"),
            Nil
          )
        }
        editionsDB.insertIssue("daily-edition", skeleton(2019, 9, 28), User("Billy", "Bragg", "billy.bragg@justice.example.com", None), now)
        editionsDB.insertIssue("daily-edition", skeleton(2019, 9, 29), User("Billy", "Bragg", "billy.bragg@justice.example.com", None), now)
        editionsDB.insertIssue("daily-edition", skeleton(2019, 9, 30), User("Billy", "Bragg", "billy.bragg@justice.example.com", None), now)
        editionsDB.insertIssue("daily-edition", skeleton(2019, 10, 10), User("Billy", "Bragg", "billy.bragg@justice.example.com", None), now)

        val allIssues = editionsDB.listIssues("daily-edition", LocalDate.of(2019, 9, 28), LocalDate.of(2019, 10, 10))
        allIssues.length shouldBe 4
        allIssues.head.createdEmail shouldBe "billy.bragg@justice.example.com"

        val someIssues = editionsDB.listIssues("daily-edition", LocalDate.of(2019, 9, 28), LocalDate.of(2019, 10, 3))
        someIssues.length shouldBe 3
      }
    }

    "should insert fronts, collections and articles" taggedAs UsesDatabase in {
      withEvolutions {
        val skeleton = EditionsIssueSkeleton(
          ZonedDateTime.of(2019, 9, 30, 0, 0, 0, 0, ZoneId.of("Europe/London")),
          ZoneId.of("Europe/London"),
          List(
            EditionsFrontSkeleton(
              name = "news/uk",
              presentation = FrontPresentation(),
              collections = List(
                EditionsCollectionSkeleton(
                  name = "politics",
                  prefill = Some(CapiPrefillQuery("magic-politics-query")),
                  presentation = CollectionPresentation(),
                  items = List(
                    "12345",
                    "23456"
                  )
                ),
                EditionsCollectionSkeleton(
                  name = "international",
                  prefill = None,
                  presentation = CollectionPresentation(),
                  items = List(
                    "34567",
                    "45678",
                    "56789"
                  )
                )
              )
            ),
            EditionsFrontSkeleton(
              name = "comment",
              presentation = FrontPresentation(),
              collections = List(
                EditionsCollectionSkeleton(
                  name = "opinion",
                  prefill = Some(CapiPrefillQuery("magic-opinion-query")),
                  presentation = CollectionPresentation(),
                  items = List(
                    "54321",
                    "65432"
                  )
                ),
                EditionsCollectionSkeleton(
                  name = "brexshit",
                  prefill = None,
                  presentation = CollectionPresentation(),
                  items = List(
                    "76543",
                    "87654"
                  )
                ),
                EditionsCollectionSkeleton(
                  name = "sigh",
                  prefill = None,
                  presentation = CollectionPresentation(),
                  items = List(
                    "98765",
                    "09876"
                  )
                )
              )
            )
          )
        )

        val now = OffsetDateTime.of(2019, 7, 16, 17, 51, 44, 0, ZoneOffset.ofHours(1))

        val id = editionsDB.insertIssue("daily-edition",
          skeleton,
          User("Billy", "Bragg", "billy.bragg@justice.example.com", None),
          now
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
  }

}
