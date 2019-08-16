package services.editions.db

import java.time._

import com.gu.pandomainauth.model.User
import fixtures.{EditionsDBService, UsesDatabase}
import model.editions._
import model.forms.GetCollectionsFilter
import org.scalatest.{FreeSpec, Matchers, OptionValues}

class EditionsDBTest extends FreeSpec with Matchers with EditionsDBService with OptionValues {

  private val now: OffsetDateTime = OffsetDateTime.of(2019, 7, 16, 17, 23, 23, 123456, ZoneOffset.ofHours(1))

  private val user: User = User("Billy", "Bragg", "billy.bragg@justice.example.com", None)

  private val simpleMetadata = ArticleMetadata(
    customKicker = Some("Kicker"),
    headline = None,
    trailText = None,
    showQuotedHeadline = None,
    showByline = None,
    byline = None,
    mediaType = None,
    cutoutImage = None,
    replaceImage = None,
    applyMediaOverrides = None,
    sportScore = None
  )

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
    EditionsFrontSkeleton(name, collections.toList, FrontPresentation(Swatch.Culture), hidden = false, isSpecial = false)

  implicit class RichFrontSkeleton(frontSkel: EditionsFrontSkeleton) {
    def special() = frontSkel.copy(isSpecial = true, hidden = true)
  }

  private def collection(name: String, prefill: Option[CapiPrefillQuery], articles: EditionsArticleSkeleton*): EditionsCollectionSkeleton =
    EditionsCollectionSkeleton(name, articles.toList, prefill, CollectionPresentation(), hidden = false)

  private def article(pageCode: String): EditionsArticleSkeleton = EditionsArticleSkeleton(pageCode, ArticleMetadata.default)

  "The editions DB" - {
    "should insert an empty issue" taggedAs UsesDatabase in {
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

    "should list issues" taggedAs UsesDatabase in {
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

    "should insert fronts, collections and articles" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          ),
          collection("international", None,
            article("34567"),
            article("45678"),
            article("56789")
          )
        ),
        front("comment",
          collection("opinion", Some(CapiPrefillQuery("magic-opinion-query")),
            article("54321"),
            article("65432")
          ),
          collection("brexshit", None,
            article("76543"),
            article("87654")
          ),
          collection("sigh", None,
            article("98765"),
            article("09876")
          )
        )
      )

      val retrievedIssue = editionsDB.getIssue(id).value
      retrievedIssue.displayName shouldBe "daily-edition"
      retrievedIssue.fronts.length shouldBe 2

      val newsFront = retrievedIssue.fronts.head
      newsFront.displayName shouldBe "news/uk"
      newsFront.collections.length shouldBe 2
      newsFront.metadata.get.nameOverride shouldBe None
      newsFront.metadata.get.swatch shouldBe Some(Swatch.Culture)

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

      val editionsArticle = newsPoliticsCollection.items.head
      editionsArticle.pageCode shouldBe "12345"

      val articleMetadata = editionsArticle.metadata.get
      articleMetadata.applyMediaOverrides shouldBe None

      commentFront.metadata.get.nameOverride shouldBe None
      commentFront.metadata.get.swatch shouldBe Some(Swatch.Culture)
    }

    "should allow lookup of issue by collection id" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          )
        )
      )
      insertSkeletonIssue(2019, 9, 29,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("54321"),
            article("65432")
          )
        )
      )
      insertSkeletonIssue(2019, 9, 28,
        front("news/uk",
          collection("politics", None,
            article("14789"),
            article("32147")
          )
        )
      )

      val retrievedIssue = editionsDB.getIssue(id).value
      val collectionsId = retrievedIssue.fronts.head.collections.head.id

      val maybeIssueId = editionsDB.getIssueIdFromCollectionId(collectionsId)
      maybeIssueId.value shouldBe id
    }

    "should allow a set of collections to be fetched individually" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          ),
          collection("international", None,article("34567"),
            article("45678"),
            article("56789")
          )
        ),
        front("comment",
          collection("opinion", Some(CapiPrefillQuery("magic-opinion-query")),
            article("54321"),
            article("65432")
          ),
          collection("brexshit", None,
            article("76543"),
            article("87654")
          ),
          collection("sigh", None,
            article("98765"),
            article("09876")
          )
        )
      )

      val retrievedIssue = editionsDB.getIssue(id).value
      val collectionIds = retrievedIssue.fronts.flatMap(_.collections.map(_.id))

      collectionIds.size shouldBe 5

      val collections = editionsDB.getCollections(
        collectionIds.map(GetCollectionsFilter(_, None))
      )

      collections.size shouldBe 5

      collections.map(_.id).toSet shouldBe collectionIds.toSet

    }

    "should allow collections to be filtered by timestamp" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          ),
          collection("international", None,
            article("34567"),
            article("45678"),
            article("56789")
          )
        ),
        front("comment",
          collection("opinion", Some(CapiPrefillQuery("magic-opinion-query")),
            article("54321"),
            article("65432")
          ),
          collection("brexshit", None,
            article("76543"),
            article("87654")
          ),
          collection("sigh", None,
            article("98765"),
            article("09876")
          )
        )
      )

      val retrievedIssue = editionsDB.getIssue(id).value
      val collectionIds = retrievedIssue.fronts.flatMap(_.collections.map(_.id))

      collectionIds.size shouldBe 5

      // pretend we are a client asking for updates since a time that is older than the creation time
      val newerCollections = editionsDB.getCollections(
        collectionIds.map(GetCollectionsFilter(_, Some(now.toInstant.toEpochMilli-1)))
      )
      newerCollections.size shouldBe 5

      // pretend we are a client asking for updates since a time that is more recent than the creation time
      val olderCollections = editionsDB.getCollections(
        collectionIds.map(GetCollectionsFilter(_, Some(now.toInstant.toEpochMilli+1)))
      )
      olderCollections.size shouldBe 0
    }

    "should allow updating of a collection" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          ),
          collection("international", None,
            article("34567"),
            article("45678"),
            article("56789")
          )
        ),
        front("comment",
          collection("opinion", Some(CapiPrefillQuery("magic-opinion-query")),
            article("54321"),
            article("65432")
          ),
          collection("brexshit", None,
            article("76543"),
            article("87654")
          ),
          collection("sigh", None,
            article("98765"),
            article("09876")
          )
        )
      )

      val retrievedIssue = editionsDB.getIssue(id).value
      val brexshit = retrievedIssue.fronts.tail.head.collections.tail.head

      val future = now.plusMinutes(20)
      val futureMillis = future.toInstant.toEpochMilli

      val items = EditionsArticle("654789", futureMillis, Some(simpleMetadata)) :: brexshit.items

      val evenMoreBrexshit = brexshit.copy(
        lastUpdated = Some(futureMillis),
        updatedBy = Some("BoJo"),
        updatedEmail = Some("bojo@piffle.paffle"),
        items = items
      )

      editionsDB.updateCollection(evenMoreBrexshit)

      val collections = editionsDB.getCollections(List(GetCollectionsFilter(brexshit.id, None)))
      collections.size shouldBe 1
      val updatedBrexshit = collections.head
      updatedBrexshit.items.size shouldBe 3

      updatedBrexshit.updatedBy.value shouldBe "BoJo"
      updatedBrexshit.updatedEmail.value shouldBe "bojo@piffle.paffle"

      updatedBrexshit.lastUpdated.value shouldBe futureMillis

      // check we are storing some metadata
      updatedBrexshit.items.find(_.pageCode == "654789").value.addedOn shouldBe future.toInstant.toEpochMilli
      updatedBrexshit.items.find(_.pageCode == "654789").value.metadata.value shouldBe simpleMetadata

      // check that the added time hasn't modified
      updatedBrexshit.items.find(_.pageCode == "76543").value.addedOn shouldBe now.toInstant.toEpochMilli
    }

    "should allow a special front's hidden status to be changed" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          )
        ).special()
      )
      val retrievedIssue = editionsDB.getIssue(id).value
      val specialFront = retrievedIssue.fronts.head
      specialFront.isSpecial shouldBe true
      specialFront.isHidden shouldBe true

      editionsDB.updateFrontHiddenState(specialFront.id, isHidden = false)

      val retrievedIssue2 = editionsDB.getIssue(id).value
      val specialFront2 = retrievedIssue2.fronts.head
      specialFront2.isSpecial shouldBe true
      specialFront2.isHidden shouldBe false

      editionsDB.updateFrontHiddenState(specialFront.id, isHidden = true)

      val retrievedIssue3 = editionsDB.getIssue(id).value
      val specialFront3 = retrievedIssue3.fronts.head
      specialFront3.isSpecial shouldBe true
      specialFront3.isHidden shouldBe true
    }

    "should now allow a normal front's hidden status to be changed" taggedAs UsesDatabase in {
      val id = insertSkeletonIssue(2019, 9, 30,
        front("news/uk",
          collection("politics", Some(CapiPrefillQuery("magic-politics-query")),
            article("12345"),
            article("23456")
          )
        )
      )
      val retrievedIssue = editionsDB.getIssue(id).value
      val specialFront = retrievedIssue.fronts.head
      specialFront.isSpecial shouldBe false
      specialFront.isHidden shouldBe false

      editionsDB.updateFrontHiddenState(specialFront.id, isHidden = true)

      val retrievedIssue2 = editionsDB.getIssue(id).value
      val specialFront2 = retrievedIssue2.fronts.head
      specialFront2.isSpecial shouldBe false
      specialFront2.isHidden shouldBe false
    }

  }

}
