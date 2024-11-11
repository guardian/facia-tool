package services.editions.db

import java.time._
import com.gu.pandomainauth.model.User
import fixtures.{EditionsDBEvolutions, EditionsDBService, UsesDatabase}
import model.editions
import model.editions.internal.PrefillUpdate
import model.editions.{TimeWindowConfigInDays, _}
import model.forms.GetCollectionsFilter
import org.scalatest.{FreeSpec, Matchers, OptionValues}
import scalikejdbc._
import services.editions.GenerateEditionTemplateResult
import services.editions.prefills.CapiQueryTimeWindow
import org.scalatest.Assertions
import services.editions.db.EditionsDB.NotFoundError
import editions.{EditionsRecipe, EditionsChef, EditionsFeastCollection}

class EditionsDBTest
    extends FreeSpec
    with Matchers
    with EditionsDBService
    with EditionsDBEvolutions
    with OptionValues {

  private val now: OffsetDateTime =
    OffsetDateTime.of(2019, 7, 16, 17, 23, 23, 123456, ZoneOffset.ofHours(1))

  private val user: User =
    User("Billy", "Bragg", "billy.bragg@justice.example.com", None)

  private val olderThenCreationTime = now.toInstant.toEpochMilli - 1

  private val moreRecentThenCreationTime = now.toInstant.toEpochMilli + 1

  private val simpleMetadata = EditionsArticleMetadata(
    customKicker = Some("Kicker"),
    headline = None,
    trailText = None,
    showQuotedHeadline = None,
    showByline = None,
    byline = None,
    mediaType = None,
    cutoutImage = None,
    replaceImage = None,
    overrideArticleMainMedia = None,
    sportScore = None,
    coverCardImages = None,
    promotionMetric = None
  )

  private val TestContentPrefillTimeWindowCfg = TimeWindowConfigInDays(-1, 2)

  private def insertSkeletonIssueForDaily(
      year: Int,
      month: Int,
      dom: Int,
      fronts: EditionsFrontSkeleton*
  ): String =
    insertSkeletonIssue(year, month, dom, Edition.DailyEdition, fronts: _*)

  private def insertSkeletonIssue(
      year: Int,
      month: Int,
      dom: Int,
      edition: Edition,
      fronts: EditionsFrontSkeleton*
  ): String = {
    val issueDate = LocalDate.of(year, month, dom)
    val skeleton = EditionsIssueSkeleton(
      issueDate,
      ZoneId.of("Europe/London"),
      fronts.toList
    )
    import TestContentPrefillTimeWindowCfg._
    val start =
      issueDate.plusDays(startOffset).atStartOfDay().toInstant(ZoneOffset.UTC)
    val end =
      issueDate.plusDays(endOffset).atStartOfDay().toInstant(ZoneOffset.UTC)
    val timeWindow = CapiQueryTimeWindow(start, end)
    val genTemplateRes = GenerateEditionTemplateResult(skeleton, timeWindow)
    editionsDB.insertIssue(
      edition,
      genTemplateRes.issueSkeleton,
      user,
      now
    )
  }

  private val capiQueryTimeWindow = CapiQueryTimeWindow(
    LocalDate.of(2019, 12, 31).atStartOfDay.toInstant(ZoneOffset.UTC),
    LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
  )
  private val TestContentPrefillTimeWindowCfg2 = TimeWindowConfigInDays(-1, 2)

  private def front(
      name: String,
      collections: EditionsCollectionSkeleton*
  ): EditionsFrontSkeleton =
    EditionsFrontSkeleton(
      name,
      collections.toList,
      FrontPresentation(Swatch.Culture),
      hidden = false,
      isSpecial = false
    )

  implicit class RichFrontSkeleton(frontSkel: EditionsFrontSkeleton) {
    def special() = frontSkel.copy(isSpecial = true, hidden = true)
  }

  private def collection(
      name: String,
      prefill: Option[CapiPrefillQuery],
      cards: EditionsCardSkeleton*
  ): EditionsCollectionSkeleton =
    EditionsCollectionSkeleton(
      name,
      cards.toList,
      prefill,
      capiQueryTimeWindow,
      hidden = false
    )

  private def card(
      id: String,
      cardType: Option[CardType] = None,
      meta: Option[EditionsCardMetadata] = None
  ): EditionsCardSkeleton =
    EditionsCardSkeleton(
      id,
      cardType.getOrElse(CardType.Article),
      meta.orElse(Some(EditionsArticleMetadata.default))
    )

  "should insert an empty issue" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(2019, 9, 30)

    val retrievedIssue = editionsDB.getIssue(id).value
    retrievedIssue.edition shouldBe Edition.DailyEdition
    retrievedIssue.createdEmail shouldBe "billy.bragg@justice.example.com"
    retrievedIssue.createdOn shouldBe now.toInstant.toEpochMilli
    retrievedIssue.createdBy shouldBe "Billy Bragg"
    retrievedIssue.issueDate.getDayOfWeek shouldBe DayOfWeek.MONDAY
    retrievedIssue.launchedOn.isDefined shouldBe false
    retrievedIssue.launchedBy.isDefined shouldBe false
    retrievedIssue.launchedEmail.isDefined shouldBe false
    retrievedIssue.fronts shouldBe Nil
  }

  "should list issues" taggedAs UsesDatabase in {
    insertSkeletonIssueForDaily(2019, 9, 28)
    insertSkeletonIssueForDaily(2019, 9, 29)
    insertSkeletonIssueForDaily(2019, 9, 30)
    insertSkeletonIssueForDaily(2019, 10, 10)

    val allIssues = editionsDB
      .listIssues(
        Edition.DailyEdition,
        LocalDate.of(2019, 9, 28),
        LocalDate.of(2019, 10, 10)
      )
      .toOption
      .get
    allIssues.length shouldBe 4
    allIssues.head.createdEmail shouldBe "billy.bragg@justice.example.com"

    val someIssues = editionsDB
      .listIssues(
        Edition.DailyEdition,
        LocalDate.of(2019, 9, 28),
        LocalDate.of(2019, 10, 3)
      )
      .toOption
      .get
    someIssues.length shouldBe 3

    val singleIssue = editionsDB
      .listIssues(
        Edition.DailyEdition,
        LocalDate.of(2019, 9, 29),
        LocalDate.of(2019, 9, 29)
      )
      .toOption
      .get
    singleIssue.length shouldBe 1
    singleIssue.head.issueDate.getDayOfMonth shouldBe 29
  }

  "should insert fronts, collections and cards" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        ),
        collection(
          "international",
          None,
          card("34567"),
          card("45678"),
          card("56789")
        )
      ),
      front(
        "comment",
        collection(
          "opinion",
          Some(CapiPrefillQuery("magic-opinion-query", PathType.PrintSent)),
          card("54321"),
          card("65432")
        ),
        collection("brexshit", None, card("76543"), card("87654")),
        collection("sigh", None, card("98765"), card("09876"))
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    retrievedIssue.edition shouldBe Edition.DailyEdition
    retrievedIssue.fronts.length shouldBe 2

    val newsFront = retrievedIssue.fronts.head
    newsFront.displayName shouldBe "news/uk"
    newsFront.collections.length shouldBe 2
    newsFront.metadata.get.nameOverride shouldBe None
    newsFront.metadata.get.swatch shouldBe Some(Swatch.Culture)

    val newsPoliticsCollection = newsFront.collections.head
    newsPoliticsCollection.displayName shouldBe "politics"
    newsPoliticsCollection.prefill.value shouldBe CapiPrefillQuery(
      "magic-politics-query",
      PathType.PrintSent
    )
    newsPoliticsCollection.items.length shouldBe 2

    val newsInternationalCollection = newsFront.collections.tail.head
    newsInternationalCollection.displayName shouldBe "international"
    newsInternationalCollection.prefill.isDefined shouldBe false
    newsInternationalCollection.items.length shouldBe 3

    val commentFront = retrievedIssue.fronts.tail.head
    commentFront.displayName shouldBe "comment"
    commentFront.collections.length shouldBe 3

    val editionsArticle = newsPoliticsCollection.items.head
    editionsArticle.id shouldBe "12345"

    val articleMetadata = editionsArticle match {
      case e: EditionsArticle => e.metadata
      case _                  => None
    }
    articleMetadata.get.overrideArticleMainMedia shouldBe None

    commentFront.metadata.get.nameOverride shouldBe None
    commentFront.metadata.get.swatch shouldBe Some(Swatch.Culture)
  }

  "should allow lookup of issue by collection id" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        )
      )
    )
    insertSkeletonIssueForDaily(
      2019,
      9,
      29,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("54321"),
          card("65432")
        )
      )
    )
    insertSkeletonIssueForDaily(
      2019,
      9,
      28,
      front(
        "news/uk",
        collection("politics", None, card("14789"), card("32147"))
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    val collectionsId = retrievedIssue.fronts.head.collections.head.id

    val maybeIssueId = editionsDB.getIssueIdFromCollectionId(collectionsId)
    maybeIssueId.value shouldBe id
  }

  "should allow a set of collections to be fetched individually" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        ),
        collection(
          "international",
          None,
          card("34567"),
          card("45678"),
          card("56789")
        )
      ),
      front(
        "comment",
        collection(
          "opinion",
          Some(CapiPrefillQuery("magic-opinion-query", PathType.PrintSent)),
          card("54321"),
          card("65432")
        ),
        collection("brexshit", None, card("76543"), card("87654")),
        collection("sigh", None, card("98765"), card("09876"))
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
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        ),
        collection(
          "international",
          None,
          card("34567"),
          card("45678"),
          card("56789")
        )
      ),
      front(
        "comment",
        collection(
          "opinion",
          Some(CapiPrefillQuery("magic-opinion-query", PathType.PrintSent)),
          card("54321"),
          card("65432")
        ),
        collection("brexshit", None, card("76543"), card("87654")),
        collection("sigh", None, card("98765"), card("09876"))
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    val collectionIds = retrievedIssue.fronts.flatMap(_.collections.map(_.id))

    collectionIds.size shouldBe 5

    // pretend we are a client asking for updates since a time that is older than the creation time
    val newerCollections = editionsDB.getCollections(
      collectionIds.map(GetCollectionsFilter(_, Some(olderThenCreationTime)))
    )
    newerCollections.size shouldBe 5

    // pretend we are a client asking for updates since a time that is more recent than the creation time
    val olderCollections = editionsDB.getCollections(
      collectionIds.map(
        GetCollectionsFilter(_, Some(moreRecentThenCreationTime))
      )
    )
    olderCollections.size shouldBe 0
  }

  "should allow renaming of a collection" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        ),
        collection(
          "international",
          None,
          card("34567"),
          card("45678"),
          card("56789")
        )
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    val brexshit = retrievedIssue.fronts.head.collections.head

    val newName = "Say My Name, Say My Name..."

    val evenMoreBrexshit = brexshit.copy(
      displayName = newName,
      updatedBy = Some("BoJo"),
      updatedEmail = Some("bojo@piffle.paffle")
    )

    editionsDB.updateCollectionName(evenMoreBrexshit)

    val collections =
      editionsDB.getCollections(List(GetCollectionsFilter(brexshit.id, None)))
    collections.size shouldBe 1
    val updatedBrexshit = collections.head

    updatedBrexshit.updatedBy.value shouldBe "BoJo"
    updatedBrexshit.updatedEmail.value shouldBe "bojo@piffle.paffle"
    updatedBrexshit.lastUpdated.value should be > brexshit.lastUpdated.value
    updatedBrexshit.displayName shouldBe newName
  }

  "should allow updating of a collection" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        ),
        collection(
          "international",
          None,
          card("34567"),
          card("45678"),
          card("56789")
        )
      ),
      front(
        "comment",
        collection(
          "opinion",
          Some(CapiPrefillQuery("magic-opinion-query", PathType.PrintSent)),
          card("54321"),
          card("65432")
        ),
        collection("brexshit", None, card("76543"), card("87654")),
        collection("sigh", None, card("98765"), card("09876"))
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    val brexshit = retrievedIssue.fronts.tail.head.collections.tail.head

    val future = now.plusMinutes(20)
    val futureMillis = future.toInstant.toEpochMilli

    val items = EditionsArticle(
      "654789",
      futureMillis,
      Some(simpleMetadata)
    ) :: brexshit.items

    val evenMoreBrexshit = brexshit.copy(
      lastUpdated = Some(futureMillis),
      displayName = "i=am-ignored",
      updatedBy = Some("BoJo"),
      updatedEmail = Some("bojo@piffle.paffle"),
      items = items
    )

    editionsDB.updateCollection(evenMoreBrexshit)

    val collections =
      editionsDB.getCollections(List(GetCollectionsFilter(brexshit.id, None)))
    collections.size shouldBe 1
    val updatedBrexshit = collections.head
    updatedBrexshit.items.size shouldBe 3

    updatedBrexshit.updatedBy.value shouldBe "BoJo"
    updatedBrexshit.updatedEmail.value shouldBe "bojo@piffle.paffle"
    updatedBrexshit.lastUpdated.value shouldBe futureMillis
    updatedBrexshit.displayName shouldBe "brexshit"

    // check we are storing some metadata
    updatedBrexshit.items
      .find(_.id == "654789")
      .value
      .addedOn shouldBe future.toInstant.toEpochMilli
    val metadata = updatedBrexshit.items.find(_.id == "654789").value match {
      case e: EditionsArticle => e.metadata
      case _                  => None
    }

    metadata.get shouldBe simpleMetadata

    // check that the added time hasn't modified
    updatedBrexshit.items
      .find(_.id == "76543")
      .value
      .addedOn shouldBe now.toInstant.toEpochMilli
  }

  "getFront" - {
    "should get all the card content in a Front" taggedAs UsesDatabase in {
      val feastFront = front(
        "news/uk",
        collection(
          "politics",
          None,
          card("recipe", Some(CardType.Recipe)),
          card(
            "chef",
            Some(CardType.Chef),
            Some(EditionsChefMetadata(Some("bio")))
          ),
          card(
            "feast-collection",
            Some(CardType.FeastCollection),
            Some(EditionsFeastCollectionMetadata(Some("title")))
          )
        )
      )

      val id = insertSkeletonIssue(
        2019,
        9,
        30,
        Edition.FeastNorthernHemisphere,
        feastFront
      )

      val frontId = editionsDB.getIssue(id).get.fronts.head.id

      DB localTx { implicit session =>
        val retrievedFront = editionsDB.getFront(frontId).get
        retrievedFront.collections.head.items.map(_.toSkeleton) shouldBe List(
          EditionsCardSkeleton("recipe", CardType.Recipe, None),
          EditionsCardSkeleton(
            "chef",
            CardType.Chef,
            Some(EditionsChefMetadata(Some("bio"), None, None))
          ),
          EditionsCardSkeleton(
            "feast-collection",
            CardType.FeastCollection,
            Some(EditionsFeastCollectionMetadata(Some("title"), None, List()))
          )
        )
      }
    }
  }

  "moveCollection" - {
    val testFront = front(
      "news/uk",
      collection("politics", None),
      collection("international", None),
      collection("culture", None),
      collection("sport", None)
    )

    val testCases = List(
      (0, List("politics", "international", "culture", "sport")),
      (1, List("international", "politics", "culture", "sport")),
      (2, List("international", "culture", "politics", "sport")),
      (3, List("international", "culture", "sport", "politics")),
      (4, List("international", "culture", "sport", "politics"))
    )

    "should update the other collections in the front when the collection index is modified, reordering as needed" - {
      testCases.foreach { case (newIndex, expectedOrder) =>
        s"moving to index $newIndex" taggedAs UsesDatabase in {
          val id = insertSkeletonIssueForDaily(2019, 9, 30, testFront)
          val retrievedIssue = editionsDB.getIssue(id).value
          val retrievedFront = retrievedIssue.fronts.head
          val firstCollection = retrievedFront.collections.head
          firstCollection.displayName shouldBe "politics"

          editionsDB.moveCollection(
            retrievedFront.id,
            firstCollection.id,
            newIndex
          ) match {
            case Right(updatedFront) =>
              val updatedCollectionDisplayNames =
                updatedFront.collections.map(_.displayName)
              updatedCollectionDisplayNames shouldBe expectedOrder
            case Left(e) => fail(e.getMessage)
          }
        }
      }
    }
  }

  "should store cards of different types" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345")
        )
      )
    )

    val retrievedIssue = editionsDB.getIssue(id).value
    val retrievedCollection = retrievedIssue.fronts.head.collections.head

    val recipeCard = EditionsRecipe("654789", now.toInstant.toEpochMilli)
    val items =
      retrievedCollection.copy(items = retrievedCollection.items :+ recipeCard)
    editionsDB.updateCollection(items)

    val collections = editionsDB.getCollections(
      List(GetCollectionsFilter(retrievedCollection.id, None))
    )
    collections.size shouldBe 1
    collections.head.items.size shouldBe 2
    collections.head.items(1) shouldBe recipeCard
  }

  "should allow a special front's hidden status to be changed" taggedAs UsesDatabase in {
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
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
    val id = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
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

  "should delete an issue and cascade the deletion to related entities" taggedAs UsesDatabase in {
    val issue = insertSkeletonIssueForDaily(
      2019,
      9,
      1,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        )
      )
    )

    val dbIssue: EditionsIssue = editionsDB.getIssue(issue).value

    val frontIds = dbIssue.fronts.map(_.id)
    frontIds.length shouldBe 1
    val frontId = frontIds.head

    val collectionIds = dbIssue.fronts.head.collections.map(_.id)
    collectionIds.length shouldBe 1
    val collectionId = collectionIds.head

    (DB localTx { implicit session =>
      sql"""SELECT id from fronts WHERE issue_id = ${dbIssue.id}"""
        .map(_.string("id"))
        .single
        .apply()
    }) shouldBe Some(frontId)

    (DB localTx { implicit session =>
      sql"""SELECT id from collections WHERE front_id = $frontId"""
        .map(_.string("id"))
        .single
        .apply()
    }) shouldBe Some(collectionId)

    (DB localTx { implicit session =>
      sql"""SELECT id from cards WHERE collection_id = $collectionId"""
        .map(_.string("id"))
        .list
        .apply()
    }).length shouldBe 2

    editionsDB.deleteIssue(dbIssue.id)
    editionsDB.getIssue(issue) should be

    // ensure an issue deletion performs a cascading delete
    (DB localTx { implicit session =>
      sql"""SELECT id from fronts WHERE id = $frontId"""
        .map(_.string("id"))
        .single
        .apply()
    }) should be

    (DB localTx { implicit session =>
      sql"""SELECT id from collections WHERE front_id = $frontId"""
        .map(_.string("id"))
        .single
        .apply()
    }) should be

    (DB localTx { implicit session =>
      sql"""SELECT id from cards WHERE collection_id = $collectionId"""
        .map(_.string("id"))
        .list
        .apply()
    }).length shouldBe 0
  }

  "should not error when trying to delete an issue that doesn't exist" taggedAs UsesDatabase in {
    editionsDB.deleteIssue("i.do.not.exist") shouldBe false
  }

  "should insert path_type and prefill correctly" taggedAs UsesDatabase in {

    val prefillFromPrintSent =
      CapiPrefillQuery("magic-politics-query", PathType.PrintSent)
    val prefillFromSearch = CapiPrefillQuery("crossword", PathType.Search)

    val newsUkIssueId = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "politics",
          Some(prefillFromPrintSent),
          card("12345"),
          card("23456")
        )
      )
    )

    val internationalIssueId = insertSkeletonIssueForDaily(
      2019,
      9,
      30,
      front(
        "news/uk",
        collection(
          "international",
          Some(prefillFromSearch),
          card("34567"),
          card("45678"),
          card("56789")
        )
      )
    )

    val ukIssue: EditionsIssue = editionsDB.getIssue(newsUkIssueId).value
    val ukIssueColFilters: List[GetCollectionsFilter] = ukIssue.fronts
      .flatMap(_.collections.map(_.id))
      .map(GetCollectionsFilter(_, Some(olderThenCreationTime)))
    val collectionFromUKIssue =
      editionsDB.getCollections(ukIssueColFilters).head

    collectionFromUKIssue.prefill should be
    collectionFromUKIssue.prefill.get shouldEqual prefillFromPrintSent

    val internationalIssue: EditionsIssue =
      editionsDB.getIssue(internationalIssueId).value
    val internationalIssueColFilters: List[GetCollectionsFilter] =
      internationalIssue.fronts
        .flatMap(_.collections.map(_.id))
        .map(GetCollectionsFilter(_, Some(olderThenCreationTime)))
    val collectionFromInternationalIssue =
      editionsDB.getCollections(internationalIssueColFilters).head

    collectionFromInternationalIssue.prefill should be
    collectionFromInternationalIssue.prefill.get shouldEqual prefillFromSearch

  }

  private def issueDateToUTCStartOfDay(issueDate: LocalDate) =
    issueDate.atStartOfDay().toInstant(ZoneOffset.UTC)

  "should insert content prefill time-window correctly" taggedAs UsesDatabase in {

    val issueId = insertSkeletonIssueForDaily(
      2020,
      1,
      1,
      front(
        "news/uk",
        collection(
          "politics",
          Some(CapiPrefillQuery("magic-politics-query", PathType.PrintSent)),
          card("12345"),
          card("23456")
        )
      )
    )

    val issue: EditionsIssue = editionsDB.getIssue(issueId).value
    val issueDate = issue.issueDate
    val collectionFromIssue = issue.fronts.head.collections.head

    val maybePrefillUpdate: Option[PrefillUpdate] =
      editionsDB.getCollectionPrefill(collectionFromIssue.id)

    maybePrefillUpdate.isDefined shouldBe true
    val prefillFromDB = maybePrefillUpdate.value
    prefillFromDB.capiQueryTimeWindow shouldEqual CapiQueryTimeWindow(
      issueDateToUTCStartOfDay(
        issueDate.plusDays(TestContentPrefillTimeWindowCfg.startOffset)
      ),
      issueDateToUTCStartOfDay(
        issueDate.plusDays(TestContentPrefillTimeWindowCfg.endOffset)
      )
    )
  }

  "getIssue" - {
    "should get an issue by date" taggedAs UsesDatabase in {
      insertSkeletonIssueForDaily(
        2020,
        1,
        1,
        front("news/uk", collection("politics", None))
      )
      val issue = editionsDB
        .getIssue(Edition.DailyEdition, LocalDate.of(2020, 1, 1))
        .value
      issue.fronts.head.displayName shouldBe "news/uk"
    }

    "should return None when the issue is not found" taggedAs UsesDatabase in {
      val issue =
        editionsDB.getIssue(Edition.DailyEdition, LocalDate.of(2020, 1, 1))

      issue shouldBe None
    }
  }

  "insertIssueFromClosestPreviousIssue" - {
    val cards = List(
      EditionsRecipe("recipe", 0L),
      EditionsChef(
        "chef",
        0L,
        Some(
          EditionsChefMetadata(
            Some("bio"),
            chefImageOverride = Some(Image(None, None, "origin", "src"))
          )
        )
      ),
      EditionsFeastCollection(
        "feast-collection",
        0L,
        Some(
          EditionsFeastCollectionMetadata(
            title = Some("Feast collection title"),
            theme = Some(
              FeastCollectionTheme(
                id = "theme",
                lightPalette = Palette("#333", "#666"),
                darkPalette = Palette("#333", "#666"),
                imageURL = None
              )
            ),
            collectionItems = List(EditionsRecipe("nested-recipe", 0L))
          )
        )
      )
    )

    val cardsSkeleton = cards.map(_.toSkeleton)

    "should insert an issue that is a copy of the closest issue prior to that issue" taggedAs UsesDatabase in {
      insertSkeletonIssue(
        2020,
        1,
        1,
        Edition.FeastNorthernHemisphere,
        front("first", collection("politics", None, cardsSkeleton: _*))
      )
      insertSkeletonIssue(
        2020,
        1,
        12,
        Edition.FeastNorthernHemisphere,
        front("second", collection("politics", None))
      )

      editionsDB.insertIssueFromClosestPreviousIssue(
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2020, 1, 2),
        user,
        now
      ) match {
        case Right(issue) =>
          issue.issueDate shouldBe LocalDate.of(2020, 1, 2)

          val front = issue.fronts.head
          val items = front.collections.head.items

          front.displayName shouldBe "first"

          items.map {
            case card: EditionsArticle         => card.copy(addedOn = 0L)
            case card: EditionsRecipe          => card.copy(addedOn = 0L)
            case card: EditionsChef            => card.copy(addedOn = 0L)
            case card: EditionsFeastCollection => card.copy(addedOn = 0L)
          } shouldBe cards
        case Left(e) => fail(e.getMessage)
      }
    }

    "should ignore any issues that don't match the edition type" taggedAs UsesDatabase in {
      insertSkeletonIssue(
        2020,
        1,
        1,
        Edition.FeastNorthernHemisphere,
        front("feast", collection("feast", None))
      )
      insertSkeletonIssue(
        2020,
        1,
        2,
        Edition.DailyEdition,
        front("editions-app", collection("not-feast", None))
      )

      editionsDB.insertIssueFromClosestPreviousIssue(
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2020, 1, 3),
        user,
        now
      ) match {
        case Right(issue) =>
          issue.issueDate shouldBe LocalDate.of(2020, 1, 3)
          val front = issue.fronts.head
          front.displayName shouldBe "feast"
        case Left(e) => fail(e.getMessage)
      }
    }

    "should only copy the fronts, collections and cards related to that issue" taggedAs UsesDatabase in {
      insertSkeletonIssue(
        2020,
        1,
        1,
        Edition.FeastNorthernHemisphere,
        front("first", collection("politics", None, cardsSkeleton: _*))
      )
      insertSkeletonIssue(
        2020,
        1,
        12,
        Edition.FeastNorthernHemisphere,
        front("second", collection("politics", None, cardsSkeleton: _*))
      )

      editionsDB.insertIssueFromClosestPreviousIssue(
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2020, 1, 13),
        user,
        now
      ) match {
        case Right(issue) =>
          issue.issueDate shouldBe LocalDate.of(2020, 1, 13)
          issue.fronts.size shouldBe 1

          val front = issue.fronts.head
          val items = front.collections.head.items

          front.displayName shouldBe "second"
          front.collections.size shouldBe 1

          items.map {
            case card: EditionsArticle         => card.copy(addedOn = 0L)
            case card: EditionsRecipe          => card.copy(addedOn = 0L)
            case card: EditionsChef            => card.copy(addedOn = 0L)
            case card: EditionsFeastCollection => card.copy(addedOn = 0L)
          } shouldBe cards
        case Left(e) => fail(e.getMessage)
      }
    }

    "should fail if there is no issue prior that that issue" taggedAs UsesDatabase in {
      editionsDB.insertIssueFromClosestPreviousIssue(
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2020, 1, 2),
        user,
        now
      ) match {
        case Left(e)  => e.getMessage should include("not found")
        case Right(_) => fail("Issue should not exist")
      }
    }
  }

  "Collection operations" - {
    "Add collection" - {
      "should insert a new collection at the specified index" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front("news/uk", collection("politics", None))
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head

        editionsDB.addCollectionToFront(
          frontFromIssue.id,
          name = Some("Test Collection"),
          user = user,
          now = now
        ) match {
          case Right((front, _)) =>
            front.collections.size shouldBe 2
            front.collections.head.displayName shouldBe "Test Collection"
          case Left(error) =>
            Assertions.fail(
              s"Error adding collection to front: ${error.getMessage}"
            )
        }
      }

      "should default to the top of the front as multiple collections are added" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssue(
          2020,
          1,
          1,
          Edition.FeastNorthernHemisphere,
          front("news/uk", collection("politics", None))
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head

        val result = for {
          _ <- editionsDB.addCollectionToFront(
            frontFromIssue.id,
            name = Some("Test Collection"),
            user = user,
            now = now
          )
          _ <- editionsDB.addCollectionToFront(
            frontFromIssue.id,
            name = Some("Test Collection 2"),
            user = user,
            now = now
          )
          front <- editionsDB.addCollectionToFront(
            frontFromIssue.id,
            name = Some("Test Collection 3"),
            user = user,
            now = now
          )
        } yield {
          front._1.collections.map(_.displayName) shouldBe List(
            "Test Collection 3",
            "Test Collection 2",
            "Test Collection",
            "politics"
          )
        }

        result.left.foreach(e => fail(e.getMessage))
      }

      "should add a default name if one is not provided" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front("news/uk", collection("politics", None))
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head

        editionsDB.addCollectionToFront(
          frontFromIssue.id,
          user = user,
          now = now
        ) match {
          case Right((front, _)) =>
            front.collections.head.displayName shouldBe "New collection"
          case Left(error) =>
            Assertions.fail(
              s"Error adding collection to front: ${error.getMessage}"
            )
        }
      }

      "should permit adding a collection to an empty front" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(2020, 1, 1, front("news/uk"))
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head

        editionsDB.addCollectionToFront(
          frontFromIssue.id,
          user = user,
          now = now
        ) match {
          case Right((front, _)) =>
            front.collections.head.displayName shouldBe "New collection"
          case Left(error) =>
            Assertions.fail(
              s"Error adding collection to front: ${error.getMessage}"
            )
        }
      }

      "should fail with a NotFoundError when the specified front does not exist" taggedAs UsesDatabase in {
        editionsDB.addCollectionToFront(
          "does-not-exist",
          user = user,
          now = now
        ) match {
          case Right(front) =>
            Assertions.fail()
          case Left(error) =>
            error shouldBe an[EditionsDB.NotFoundError]
        }
      }

      "should fail with a WriteError when we attempt to write to an invalid index" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front("news/uk", collection("politics", None))
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head
        val invalidIndex = Some(16)

        editionsDB.addCollectionToFront(
          frontFromIssue.id,
          collectionIndex = invalidIndex,
          user = user,
          now = now
        ) match {
          case Right(_) =>
            Assertions.fail()
          case Left(error) =>
            error shouldBe an[EditionsDB.InvalidInput]
        }
      }
    }

    "Remove collection" - {
      "should remove a given collection" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front(
            "news/uk",
            collection("politics", None),
            collection("sport", None),
            collection("culture", None)
          )
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head
        frontFromIssue.collections.size shouldBe 3

        editionsDB.removeCollectionFromFront(
          frontFromIssue.id,
          frontFromIssue.collections(2).id,
          user = user,
          now = now
        ) match {
          case Right(front) =>
            front.collections.map(_.displayName) shouldBe List(
              "politics",
              "sport"
            )
          case Left(error) =>
            Assertions.fail(
              s"Error removing collection to front: ${error.getMessage}"
            )
        }

        editionsDB.removeCollectionFromFront(
          frontFromIssue.id,
          frontFromIssue.collections(0).id,
          user = user,
          now = now
        ) match {
          case Right(front) =>
            front.collections.map(_.displayName) shouldBe List("sport")
          case Left(error) =>
            Assertions.fail(
              s"Error removing collection to front: ${error.getMessage}"
            )
        }
      }

      "should fail when the front does not exist" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front(
            "news/uk",
            collection("politics", None),
            collection("sport", None),
            collection("culture", None)
          )
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head
        frontFromIssue.collections.size shouldBe 3

        editionsDB.removeCollectionFromFront(
          "does-not-exist",
          frontFromIssue.collections(2).id,
          user = user,
          now = now
        ) match {
          case Right(front) =>
            Assertions.fail(
              s"Removing a collection from a front that does not exist should not succeed"
            )
          case Left(error) =>
            error shouldBe an[NotFoundError]
        }
      }

      "should fail when the collection does not exist" taggedAs UsesDatabase in {
        val issueId = insertSkeletonIssueForDaily(
          2020,
          1,
          1,
          front(
            "news/uk",
            collection("politics", None),
            collection("sport", None),
            collection("culture", None)
          )
        )
        val issue: EditionsIssue = editionsDB.getIssue(issueId).value
        val frontFromIssue = issue.fronts.head
        frontFromIssue.collections.size shouldBe 3

        editionsDB.removeCollectionFromFront(
          frontFromIssue.id,
          "does-not-exist",
          user = user,
          now = now
        ) match {
          case Right(front) =>
            Assertions.fail(
              s"Removing a collection that does not exist should not succeed"
            )
          case Left(error) =>
            error shouldBe an[NotFoundError]
        }
      }
    }
  }
}
