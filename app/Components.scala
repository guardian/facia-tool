import conf.ApplicationConfiguration
import config.{CustomGzipFilter, UpdateManager}
import controllers._
import frontsapi.model.UpdateActions
import metrics.CloudWatch
import permissions.Permissions
import play.api.ApplicationLoader.Context
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.routing.Router
import play.api.{BuiltInComponentsFromContext, Mode}
import play.filters.cors.CORSFilter
import router.Routes
import services._
import slices.{Containers, FixedContainers}
import thumbnails.ContainerThumbnails
import tools.FaciaApiIO
import updates.{AuditingUpdates, BreakingNewsUpdate}
import util.{Acl, Encryption}

class AppComponents(context: Context) extends BuiltInComponentsFromContext(context) with AhcWSComponents {
  val isTest = context.environment.mode == Mode.Test
  val isProd = context.environment.mode == Mode.Prod
  val isDev = context.environment.mode == Mode.Dev
  val appConfiguration = new ApplicationConfiguration(configuration, isProd)
  val awsEndpoints = new AwsEndpoints(appConfiguration)
  val permissions = new Permissions(appConfiguration)
  val acl = new Acl(permissions)
  val frontsApi = new FrontsApi(appConfiguration, awsEndpoints)
  val s3FrontsApi = new S3FrontsApi(appConfiguration, isTest, awsEndpoints)
  val faciaApiIO = new FaciaApiIO(frontsApi, s3FrontsApi)
  val configAgent = new ConfigAgent(appConfiguration, frontsApi)
  val auditingUpdates = new AuditingUpdates(appConfiguration, configAgent)
  val breakingNewsUpdate = new BreakingNewsUpdate(appConfiguration, wsApi, auditingUpdates)
  val fixedContainers = new FixedContainers(appConfiguration)
  val containerThumbnails = new ContainerThumbnails(fixedContainers)
  val containers = new Containers(fixedContainers)
  val faciaPressQueue = new FaciaPressQueue(appConfiguration)
  val faciaPress = new FaciaPress(faciaPressQueue, configAgent)
  val updateActions = new UpdateActions(faciaApiIO, frontsApi, appConfiguration, configAgent)
  val updateManager = new UpdateManager(updateActions, configAgent, s3FrontsApi)
  val cloudwatch = new CloudWatch(appConfiguration, awsEndpoints)
  val press = new Press(faciaPress)
  val assetsManager = new AssetsManager(appConfiguration, isDev)
  val encryption = new Encryption(appConfiguration)
  val mediaApi = new MediaApi(appConfiguration, wsApi)
  val mediaServiceClient = new MediaServiceClient(mediaApi)

  val collection = new CollectionController(appConfiguration, acl, auditingUpdates, updateManager, press, wsClient)
  val defaults = new DefaultsController(appConfiguration, acl, isDev, wsClient)
  val faciaCapiProxy = new FaciaContentApiProxy(wsApi, appConfiguration, wsClient)
  val faciaTool = new FaciaToolController(appConfiguration, acl, frontsApi, faciaApiIO, updateActions, breakingNewsUpdate,
    auditingUpdates, faciaPress, faciaPressQueue, configAgent, s3FrontsApi, mediaServiceClient, wsClient)
  val front = new FrontController(appConfiguration, acl, auditingUpdates, updateManager, press, wsClient)
  val pandaAuth = new PandaAuthController(appConfiguration, wsClient)
  val status = new StatusController
  val storiesVisible = new StoriesVisibleController(appConfiguration, containers, wsClient)
  val thumbnail = new ThumbnailController(appConfiguration, containerThumbnails, wsClient)
  val troubleshoot = new TroubleshootController(appConfiguration, wsClient)
  val uncachedAssets = new UncachedAssets
  val v2Assets = new V2Assets
  val vanityRedirects = new VanityRedirects(appConfiguration, acl, wsClient)
  val views = new ViewsController(appConfiguration, acl, assetsManager, isDev, encryption, wsClient)
  val pressController = new PressController(appConfiguration, awsEndpoints, wsClient)
  val loggingHttpErrorHandler = new LoggingHttpErrorHandler(environment, configuration, sourceMapper)
  val v2App = new V2App(appConfiguration, isDev, acl)

  val assets = new controllers.Assets(loggingHttpErrorHandler)
  val router: Router = new Routes(loggingHttpErrorHandler, status, pandaAuth, v2Assets, uncachedAssets, views, faciaTool,
    pressController, defaults, faciaCapiProxy, thumbnail, front, collection, storiesVisible, vanityRedirects,
    troubleshoot, v2App)

  override lazy val httpFilters = Seq(
    new CustomGzipFilter()(materializer),
    new CORSFilter
  )
}
