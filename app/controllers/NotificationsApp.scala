package controllers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import org.scanamo._
import org.scanamo.syntax._
import model.{FeatureSwitch, UserData}

import scala.concurrent.ExecutionContext
import com.gu.facia.client.models.{Metadata, TargetedTerritory}
import org.apache.hc.core5.reactor.Command.Priority
import permissions.Permissions
import play.api.libs.json.Json
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import switchboard.SwitchManager
import util.{AccessGranted, Acl, AclJson}

class NotificationsApp(
    isDev: Boolean,
    val acl: Acl,
    dynamoClient: DynamoDbClient,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps) {

  import model.UserData._

  val jsFileName = "dist/index.js"
  val cssFileName = "dist/index.css"
  val faviconDirectoryName = "favicon/"

  def index() = AccessAuthAction { req =>
    import org.scanamo.generic.auto._

    val jsLocation: String =
      routes.NotificationsToolAssets.at(jsFileName).toString
    val cssLocation: String =
      routes.NotificationsToolAssets.at(cssFileName).toString
    val faviconLocation: String =
      routes.NotificationsToolAssets.at(faviconDirectoryName).toString

    val pinboardPermission =
      acl.testUser(Permissions.Pinboard, "facia-tool-allow-pinboard-for-all")(
        req.user.email
      )

    // TO DO - client config class
    val configJson = s"{\"userEmail\":\"${req.user.email}\", \"firstName\":\"${req.user.firstName}\", \"lastName\":\"${req.user.lastName}\", \"avatarUrl\":\"${req.user.avatarUrl.getOrElse("null")}\"}"

    Ok(
      views.html.notificationsTool
        .app(
          "Notifications Tool",
          jsLocation,
          cssLocation,
          faviconLocation,
          configJson,
          isDev,
          maybePinboardUrl = pinboardPermission match {
            case AccessGranted =>
              Some(
                s"https://pinboard.${config.environment.correspondingToolsDomainSuffix}/pinboard.loader.js"
              )
            case _ =>
              None
          },
          maybeTelemetryUrl = Some(telemetryUrl)
        )
    )
  }

}
