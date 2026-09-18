package controllers

import com.gu.permissions.{PermissionDefinition, PermissionsProvider}
import com.gu.pandomainauth.{PanDomainAuthSettingsRefresher, S3BucketLoader}
import com.gu.pandomainauth.model.{AuthenticatedUser, User}
import conf.ApplicationConfiguration
import fixtures.{FaciaDBService, UsesDatabase}
import model.packages.{
  FeastPackageMetadata,
  Package,
  PackageCardRow,
  PackageCardType
}
import model.packages.client.CreatePackageRequest
import org.mockito.ArgumentMatchers.{any, anyString}
import org.mockito.Mockito.{mock, when}
import org.scalatest.{BeforeAndAfter, FreeSpec, Matchers}
import org.apache.pekko.util.ByteString
import org.apache.pekko.util.Timeout
import org.apache.pekko.stream.Materializer
import play.api.ApplicationLoader
import play.api.db.evolutions.Evolutions
import play.api.http.HttpVerbs
import play.api.libs.json.{JsArray, JsObject, Json}
import play.api.mvc.Cookie
import play.api.routing.Router
import play.api.test.FakeRequest
import play.api.test.Helpers.{
  CONTENT_TYPE,
  CREATED,
  NO_CONTENT,
  OK,
  call,
  contentAsJson,
  status
}
import scalikejdbc._
import services.Capi
import services.editions.db.FaciaDB
import services.editions.publishing.Publishing

import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import java.security.KeyPairGenerator
import java.time.{Instant, OffsetDateTime, ZoneOffset}
import java.util.{Base64, UUID}
import scala.concurrent.duration._

class PackageControllerHttpIntegrationTest
    extends FreeSpec
    with Matchers
    with FaciaDBService
    with BeforeAndAfter {

  implicit private val timeout: Timeout = 5.seconds
  implicit private lazy val materializer: Materializer = components.materializer

  private val authCookieName = "facia-test-auth"
  private val authDomain = "local.dev-gutools.co.uk"

  private val keyPair = {
    val generator = KeyPairGenerator.getInstance("RSA")
    generator.initialize(2048)
    generator.generateKeyPair()
  }

  private val panDomainSettingsText = {
    val encoder = Base64.getEncoder
    val publicKey = encoder.encodeToString(keyPair.getPublic.getEncoded)
    val privateKey = encoder.encodeToString(keyPair.getPrivate.getEncoded)

    s"""publicKey=$publicKey
privateKey=$privateKey
cookieName=$authCookieName
clientId=test-client-id
clientSecret=test-client-secret
discoveryDocumentUrl=https://example.test/.well-known/openid-configuration
"""
  }

  private class TestComponents(
      val db: FaciaDB,
      publishing: Publishing,
      capi: Capi,
      testPermissions: PermissionsProvider
  ) extends BaseFaciaControllerComponents(
        ApplicationLoader.Context.create(play.api.Environment.simple())
      ) {

    override val config: ApplicationConfiguration =
      new ApplicationConfiguration(
        this.context.initialConfiguration,
        isProd = false
      )

    override lazy val permissions: PermissionsProvider = testPermissions

    override lazy val panDomainSettings: PanDomainAuthSettingsRefresher =
      PanDomainAuthSettingsRefresher(
        domain = authDomain,
        system = "fronts",
        s3BucketLoader = new S3BucketLoader {
          override def inputStreamFetching(path: String): ByteArrayInputStream =
            new ByteArrayInputStream(
              panDomainSettingsText.getBytes(StandardCharsets.UTF_8)
            )
        }
      )

    val packageController =
      new PackageController(db, publishing, capi, this)

    override lazy val router: Router = Router.empty
    override lazy val httpFilters = Seq.empty
  }

  private val permissionsProvider = {
    val permissions = mock(classOf[PermissionsProvider])
    when(
      permissions.hasPermission(any(classOf[PermissionDefinition]), anyString())
    )
      .thenReturn(true)
    permissions
  }

  private lazy val components =
    new TestComponents(
      editionsDB,
      mock(classOf[Publishing]),
      mock(classOf[Capi]),
      permissionsProvider
    )

  private lazy val authCookie: Cookie =
    components.packageController.generateCookie(
      AuthenticatedUser(
        user = User("Test", "Editor", "test.editor@guardian.co.uk", None),
        authenticatingSystem = "fronts",
        authenticatedIn = Set("fronts"),
        expires = Instant.now().plusSeconds(3600),
        multiFactor = true
      )
    )

  private def authed[A](request: FakeRequest[A]): FakeRequest[A] =
    request.withCookies(authCookie)

  private def emptyAuthedRequest(method: String, path: String) =
    authed(FakeRequest(method, path).withBody(""))

  private def jsonBody(
      result: scala.concurrent.Future[play.api.mvc.Result]
  ): JsObject =
    contentAsJson(result).as[JsObject]

  private def prefillPackage(
      packageId: UUID,
      name: String,
      createdOnMillis: Long,
      cards: Int
  ): Unit = {
    editionsDB.createPackage(
      CreatePackageRequest(
        id = packageId.toString,
        name = name,
        isHidden = false,
        packageType = Package.PackageType.Feast,
        metadata = Some(
          FeastPackageMetadata(
            targetedRegions = Some(Seq("uk")),
            excludedRegions = Some(Seq("us"))
          )
        ),
        createdOn = createdOnMillis,
        createdBy = "Test Editor",
        createdEmail = "test.editor@guardian.co.uk"
      )
    )

    (0 until cards).foreach { idx =>
      editionsDB.insertCard(
        packageId,
        PackageCardRow(
          packageId = packageId.toString,
          cardType = PackageCardType.Recipe,
          pageCode = s"recipe-$idx",
          index = idx,
          metadata = Some(Json.obj("slot" -> idx)),
          addedOn = OffsetDateTime
            .ofInstant(Instant.ofEpochMilli(createdOnMillis), ZoneOffset.UTC),
          addedBy = "Test Editor",
          addedEmail = "test.editor@guardian.co.uk"
        )
      )
    }
  }

  override def beforeAll(): Unit = {
    super.beforeAll()
    Evolutions.applyEvolutions(database)
  }

  override def afterAll(): Unit = {
    Evolutions.cleanupEvolutions(database)
    database.shutdown()
    super.afterAll()
  }

  before {
    DB localTx { implicit session =>
      sql"DELETE FROM package_cards".update.apply()
      sql"DELETE FROM packages".update.apply()
    }
  }

  "packages endpoints over Play HTTP" - {

    "create a package with POST and fetch it with GET" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      val createdOn = Instant.now().toEpochMilli

      val createRequest = authed(
        FakeRequest(HttpVerbs.POST, "/packages")
          .withHeaders(CONTENT_TYPE -> "application/json")
          .withBody(
            Json.obj(
              "id" -> packageId.toString,
              "name" -> "Created package",
              "isHidden" -> false,
              "packageType" -> "Feast",
              "metadata" -> Json.obj(
                "targetedRegions" -> Json.arr("uk"),
                "excludedRegions" -> Json.arr("us")
              ),
              "createdOn" -> createdOn,
              "createdBy" -> "Test Editor",
              "createdEmail" -> "test.editor@guardian.co.uk"
            )
          )
      )

      status(
        call(components.packageController.createPackage, createRequest)
      ) shouldBe CREATED

      val fetched =
        call(
          components.packageController.getPackage(packageId),
          emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
        )
      status(fetched) shouldBe OK
      val body = jsonBody(fetched)
      (body \\ "id").head.as[String] shouldBe packageId.toString
      (body \\ "name").head.as[String] shouldBe "Created package"
    }

    "get a prefilled package by id" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      prefillPackage(
        packageId,
        "Prefilled package",
        Instant.now().toEpochMilli,
        cards = 3
      )

      val result = call(
        components.packageController.getPackage(packageId),
        emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
      )
      status(result) shouldBe OK

      val body = jsonBody(result)
      (body \\ "name").head.as[String] shouldBe "Prefilled package"
      (body \\ "items").head.as[JsArray].value.size shouldBe 3
    }

    "list packages with GET /packages" taggedAs UsesDatabase in {
      prefillPackage(
        UUID.randomUUID(),
        "One",
        Instant.now().minusSeconds(90).toEpochMilli,
        cards = 0
      )
      prefillPackage(
        UUID.randomUUID(),
        "Two",
        Instant.now().toEpochMilli,
        cards = 0
      )

      val result = call(
        components.packageController.listPackages(
          id = None,
          full = None,
          date = None,
          strict = None,
          title = None,
          limit = None,
          order = Some("created")
        ),
        emptyAuthedRequest(HttpVerbs.GET, "/packages?order=created")
      )
      status(result) shouldBe OK

      val body = jsonBody(result)
      (body \\ "status").head.as[String] shouldBe "ok"
      (body \\ "packages").head.as[JsArray].value.size shouldBe 2
    }

    "support sort order params and title search" taggedAs UsesDatabase in {
      prefillPackage(
        UUID.randomUUID(),
        "Alpha brunch",
        Instant.now().minusSeconds(180).toEpochMilli,
        cards = 0
      )
      val newestId = UUID.randomUUID()
      prefillPackage(
        newestId,
        "Bravo lunch",
        Instant.now().toEpochMilli,
        cards = 0
      )
      prefillPackage(
        UUID.randomUUID(),
        "Charlie supper",
        Instant.now().minusSeconds(60).toEpochMilli,
        cards = 0
      )

      val createdSorted = call(
        components.packageController.listPackages(
          id = None,
          full = None,
          date = None,
          strict = None,
          title = None,
          limit = None,
          order = Some("created")
        ),
        emptyAuthedRequest(HttpVerbs.GET, "/packages?order=created")
      )
      status(createdSorted) shouldBe OK
      val createdPackages =
        (jsonBody(createdSorted) \\ "packages").head.as[JsArray].value
      createdPackages.map(_.as[JsObject].value("id").as[String]) should contain(
        newestId.toString
      )

      val updatedSorted = call(
        components.packageController.listPackages(
          id = None,
          full = None,
          date = None,
          strict = None,
          title = None,
          limit = None,
          order = Some("updated")
        ),
        emptyAuthedRequest(HttpVerbs.GET, "/packages?order=updated")
      )
      status(updatedSorted) shouldBe OK

      val titleSearch = call(
        components.packageController.listPackages(
          id = None,
          full = None,
          date = None,
          strict = None,
          title = Some("Bravo"),
          limit = None,
          order = Some("title")
        ),
        emptyAuthedRequest(HttpVerbs.GET, "/packages?order=title&title=Bravo")
      )
      status(titleSearch) shouldBe OK
      val names = (jsonBody(titleSearch) \\ "packages").head
        .as[JsArray]
        .value
        .map(_.as[JsObject].value("name").as[String])
      names should contain only "Bravo lunch"
    }

    "overwrite an existing package with PUT" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      val createdOn = Instant.now().minusSeconds(120).toEpochMilli
      prefillPackage(packageId, "Before overwrite", createdOn, cards = 2)

      val putRequest = authed(
        FakeRequest(HttpVerbs.PUT, s"/packages/$packageId")
          .withHeaders(CONTENT_TYPE -> "application/json")
          .withBody(
            Json.obj(
              "id" -> packageId.toString,
              "name" -> "After overwrite",
              "isHidden" -> false,
              "packageType" -> "Feast",
              "metadata" -> Json.obj(
                "targetedRegions" -> Json.arr("gb"),
                "excludedRegions" -> Json.arr("us")
              ),
              "createdOn" -> createdOn,
              "createdBy" -> "Test Editor",
              "createdEmail" -> "test.editor@guardian.co.uk",
              "updatedOn" -> Instant.now().toEpochMilli,
              "updatedBy" -> "Overwrite User",
              "updatedEmail" -> "overwrite@guardian.co.uk",
              "items" -> Json.arr(
                Json.obj(
                  "id" -> "recipe-overwrite-0",
                  "cardType" -> "recipe",
                  "addedOn" -> Instant.now().toEpochMilli,
                  "metadata" -> Json.obj("rank" -> 0)
                ),
                Json.obj(
                  "id" -> "recipe-overwrite-1",
                  "cardType" -> "recipe",
                  "addedOn" -> Instant.now().toEpochMilli,
                  "metadata" -> Json.obj("rank" -> 1)
                )
              )
            )
          )
      )

      val result =
        call(components.packageController.writePackage(packageId), putRequest)
      status(result) shouldBe OK
      val body = jsonBody(result)
      (body \\ "name").head.as[String] shouldBe "After overwrite"
      (body \\ "items").head
        .as[JsArray]
        .value
        .map(_.as[JsObject].value("id").as[String]) should contain allOf (
        "recipe-overwrite-0",
        "recipe-overwrite-1"
      )
    }

    "patch only package name" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      prefillPackage(
        packageId,
        "Before name patch",
        Instant.now().toEpochMilli,
        cards = 0
      )

      val request = authed(
        FakeRequest(HttpVerbs.PATCH, s"/packages/$packageId/name")
          .withHeaders(CONTENT_TYPE -> "text/plain; charset=utf-8")
          .withBody(ByteString("Renamed with patch"))
      )

      status(
        call(components.packageController.updateName(packageId), request)
      ) shouldBe NO_CONTENT

      val fetched = call(
        components.packageController.getPackage(packageId),
        emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
      )
      (jsonBody(fetched) \\ "name").head
        .as[String] shouldBe "Renamed with patch"
    }

    "patch only feast metadata regions" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      prefillPackage(
        packageId,
        "Region package",
        Instant.now().toEpochMilli,
        cards = 0
      )

      val request = authed(
        FakeRequest(HttpVerbs.PATCH, s"/packages/$packageId/update-regions")
          .withHeaders(CONTENT_TYPE -> "application/json")
          .withBody(
            Json.obj(
              "targetedRegions" -> Json.arr("au", "uk"),
              "excludedRegions" -> Json.arr("us")
            )
          )
      )

      status(
        call(components.packageController.updateRegions(packageId), request)
      ) shouldBe NO_CONTENT

      val fetched = call(
        components.packageController.getPackage(packageId),
        emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
      )
      val meta = (jsonBody(fetched) \\ "metadata").head.as[JsObject]
      meta
        .value("targetedRegions")
        .as[JsArray]
        .value
        .map(_.as[String]) should contain allOf (
        "au",
        "uk"
      )
    }

    "toggle hidden flag with PUT /is-hidden" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      prefillPackage(
        packageId,
        "Hidden package",
        Instant.now().toEpochMilli,
        cards = 0
      )

      status(
        call(
          components.packageController
            .putPackageHiddenState(packageId, newState = true),
          emptyAuthedRequest(
            HttpVerbs.PUT,
            s"/packages/$packageId/is-hidden/true"
          )
        )
      ) shouldBe NO_CONTENT

      val fetched = call(
        components.packageController.getPackage(packageId),
        emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
      )
      (jsonBody(fetched) \\ "isHidden").head.as[Boolean] shouldBe true
    }

    "update metadata only with PUT /metadata" taggedAs UsesDatabase in {
      val packageId = UUID.randomUUID()
      prefillPackage(
        packageId,
        "Metadata package",
        Instant.now().toEpochMilli,
        cards = 0
      )

      val request = authed(
        FakeRequest(HttpVerbs.PUT, s"/packages/$packageId/metadata")
          .withHeaders(CONTENT_TYPE -> "application/json")
          .withBody(
            Json.obj(
              "targetedRegions" -> Json.arr("eu"),
              "excludedRegions" -> Json.arr("us")
            )
          )
      )

      status(
        call(components.packageController.putMetadata(packageId), request)
      ) shouldBe NO_CONTENT

      val fetched = call(
        components.packageController.getPackage(packageId),
        emptyAuthedRequest(HttpVerbs.GET, s"/packages/$packageId")
      )
      val meta = (jsonBody(fetched) \\ "metadata").head.as[JsObject]
      meta
        .value("targetedRegions")
        .as[JsArray]
        .value
        .map(_.as[String]) should contain only "eu"
      (jsonBody(fetched) \\ "name").head.as[String] shouldBe "Metadata package"
    }
  }
}
