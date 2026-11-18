package controllers

import com.gu.facia.client.models._
import com.gu.pandomainauth.{PanDomainAuthSettingsRefresher, S3BucketLoader}
import com.gu.pandomainauth.model.{AuthenticatedUser, User}
import com.gu.permissions.PermissionsProvider
import conf.ApplicationConfiguration
import org.apache.pekko.stream.Materializer
import org.joda.time.DateTime
import org.mockito.Mockito.{verifyNoInteractions, when}
import org.scalatest.{BeforeAndAfterAll, FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import permissions.Permissions
import play.api.ApplicationLoader
import play.api.libs.json.Json
import play.api.routing.Router
import play.api.test.FakeRequest
import play.api.test.Helpers._
import services.CustomSubnavApi
import util.Acl

import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import java.security.KeyPairGenerator
import java.time.Instant
import java.util.Base64
import scala.concurrent.Await
import scala.concurrent.duration._

class CustomSubnavControllerTest
    extends FreeSpec
    with Matchers
    with MockitoSugar
    with BeforeAndAfterAll {
  private val api = mock[CustomSubnavApi]
  private val acl = mock[Acl]
  private val permissions = mock[PermissionsProvider]
  private val email = "test.editor@guardian.co.uk"
  when(permissions.hasPermission(Permissions.FrontsAccess, email))
    .thenReturn(true)

  private lazy val components = new BaseFaciaControllerComponents(
    ApplicationLoader.Context.create(play.api.Environment.simple())
  ) {
    override val config =
      new ApplicationConfiguration(context.initialConfiguration, isProd = false)
    override lazy val permissions: PermissionsProvider =
      CustomSubnavControllerTest.this.permissions
    override lazy val router: Router = Router.empty
    override lazy val httpFilters = Seq.empty
    override lazy val panDomainSettings: PanDomainAuthSettingsRefresher = {
      val generator = KeyPairGenerator.getInstance("RSA")
      generator.initialize(2048)
      val keyPair = generator.generateKeyPair()
      val encoder = Base64.getEncoder
      val settings =
        s"""publicKey=${encoder.encodeToString(keyPair.getPublic.getEncoded)}
privateKey=${encoder.encodeToString(keyPair.getPrivate.getEncoded)}
cookieName=subnav-test-auth
clientId=test-client-id
clientSecret=test-client-secret
discoveryDocumentUrl=https://example.test/.well-known/openid-configuration
"""
      PanDomainAuthSettingsRefresher(
        domain = "local.dev-gutools.co.uk",
        system = "fronts",
        s3BucketLoader = new S3BucketLoader {
          override def inputStreamFetching(path: String): ByteArrayInputStream =
            new ByteArrayInputStream(settings.getBytes(StandardCharsets.UTF_8))
        }
      )
    }
  }
  implicit private lazy val materializer: Materializer = components.materializer
  private lazy val controller =
    new CustomSubnavController(acl, api, components)(
      components.executionContext
    )
  private lazy val authCookie = controller.generateCookie(
    AuthenticatedUser(
      user = User("Test", "Editor", email, None),
      authenticatingSystem = "fronts",
      authenticatedIn = Set("fronts"),
      expires = Instant.now().plusSeconds(3600),
      multiFactor = true
    )
  )

  private val published = CustomSubnav(
    id = "published",
    header = CustomSubnavHeader("Published title", None, "Copy"),
    format = CustomSubnavFormat.Large,
    links = Nil,
    pages = Nil,
    images = None,
    palette = None,
    lastUpdated = new DateTime(0),
    updatedBy = "Test Editor",
    updatedEmail = email
  )

  "resolvePublishedSubnav" - {
    "returns the published title without subnav management permission" in {
      when(api.getPublishedSubnav("published"))
        .thenReturn(Right(Some(published)))
      val result = call(
        controller.resolvePublishedSubnav("published"),
        FakeRequest(GET, "/custom-subnav/published/resolve").withCookies(
          authCookie
        )
      )

      status(result) should be(OK)
      contentAsJson(result) should be(
        Json.obj("id" -> "published", "title" -> "Published title")
      )
      headers(result).apply("Cache-Control") should include("no-cache")
      verifyNoInteractions(acl)
    }

    "returns 404 for a missing subnav" in {
      when(api.getPublishedSubnav("unpublished")).thenReturn(Right(None))
      val result = call(
        controller.resolvePublishedSubnav("unpublished"),
        FakeRequest(GET, "/custom-subnav/unpublished/resolve").withCookies(
          authCookie
        )
      )

      status(result) should be(NOT_FOUND)
    }

    "returns 500 rather than not found if the stored config cannot be read" in {
      when(api.getPublishedSubnav("broken")).thenReturn(
        Left(CustomSubnavApi.ConfigLoadFailed)
      )
      val result = call(
        controller.resolvePublishedSubnav("broken"),
        FakeRequest(GET, "/custom-subnav/broken/resolve").withCookies(
          authCookie
        )
      )

      status(result) should be(INTERNAL_SERVER_ERROR)
    }

    "returns a distinct validation error for a draft-only subnav" in {
      when(api.getPublishedSubnav("draft")).thenReturn(
        Left(CustomSubnavApi.DraftSubnav)
      )
      val result = call(
        controller.resolvePublishedSubnav("draft"),
        FakeRequest(GET, "/custom-subnav/draft/resolve").withCookies(authCookie)
      )

      status(result) should be(CONFLICT)
      contentAsString(result) should be(
        "Custom subnav is not published, and so cannot be linked"
      )
    }

    "requires authentication" in {
      val result = call(
        controller.resolvePublishedSubnav("published"),
        FakeRequest(GET, "/custom-subnav/published/resolve")
      )

      status(result) should be(UNAUTHORIZED)
    }
  }

  override protected def afterAll(): Unit =
    try Await.result(components.application.stop(), 10.seconds)
    finally super.afterAll()
}
