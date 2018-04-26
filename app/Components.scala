import conf.ApplicationConfiguration
import config.{CustomGzipFilter, UpdateManager}
import controllers._
import frontsapi.model.UpdateActions
import metrics.CloudWatch
import permissions.Permissions
import play.api.ApplicationLoader.Context
import play.api.Mode
import play.api.routing.Router
import play.filters.cors.CORSFilter
import router.Routes
import services._
import slices.{Containers, FixedContainers}
import thumbnails.ContainerThumbnails
import tools.FaciaApiIO
import updates.{AuditingUpdates, BreakingNewsUpdate}
import util.{Acl, Encryption}

class AppComponents(context: Context) extends BaseFaciaControllerComponents(context) {
  val isTest: Boolean = context.environment.mode == Mode.Test
  val isProd: Boolean = context.environment.mode == Mode.Prod
  val isDev: Boolean = context.environment.mode == Mode.Dev
  val config = new ApplicationConfiguration(configuration, isProd)
  val awsEndpoints = new AwsEndpoints(config)
  val permissions = new Permissions(config)
  val acl = new Acl(permissions)
  val frontsApi = new FrontsApi(config, awsEndpoints)
  val s3FrontsApi = new S3FrontsApi(config, isTest, awsEndpoints)
  val faciaApiIO = new FaciaApiIO(frontsApi, s3FrontsApi)
  val configAgent = new ConfigAgent(config, frontsApi)
  val auditingUpdates = new AuditingUpdates(config, configAgent)
  val breakingNewsUpdate = new BreakingNewsUpdate(config, wsClient, auditingUpdates)
  val fixedContainers = new FixedContainers(config)
  val containerThumbnails = new ContainerThumbnails(fixedContainers)
  val containers = new Containers(fixedContainers)
  val faciaPressQueue = new FaciaPressQueue(config)
  val faciaPress = new FaciaPress(faciaPressQueue, configAgent)
  val updateActions = new UpdateActions(faciaApiIO, frontsApi, config, configAgent)
  val updateManager = new UpdateManager(updateActions, configAgent, s3FrontsApi)
  val cloudwatch = new CloudWatch(config, awsEndpoints)
  val press = new Press(faciaPress)
  val assetsManager = new AssetsManager(config, isDev)
  val encryption = new Encryption(config)
  val mediaApi = new MediaApi(config, wsClient)
  val mediaServiceClient = new MediaServiceClient(mediaApi)
  val loggingHttpErrorHandler = new LoggingHttpErrorHandler(environment, configuration, sourceMapper, Some(router))

//  Controllers
  val collection = new CollectionController(acl, auditingUpdates, updateManager, press, this)
  val defaults = new DefaultsController(acl, isDev, this)
  val faciaCapiProxy = new FaciaContentApiProxy(this)
  val faciaTool = new FaciaToolController(acl, frontsApi, faciaApiIO, updateActions, breakingNewsUpdate,
    auditingUpdates, faciaPress, faciaPressQueue, configAgent, s3FrontsApi, mediaServiceClient, this)
  val front = new FrontController(acl, auditingUpdates, updateManager, press, this)
  val pandaAuth = new PandaAuthController(this)
  val status = new StatusController(this)
  val storiesVisible = new StoriesVisibleController(containers, this)
  val thumbnail = new ThumbnailController(containerThumbnails, this)
  val troubleshoot = new TroubleshootController(this)
  val uncachedAssets = new UncachedAssets(assets, this)
  val v2Assets = new V2Assets(assets)
  val vanityRedirects = new VanityRedirects(acl, this)
  val views = new ViewsController(acl, assetsManager, isDev, encryption, this)
  val pressController = new PressController(awsEndpoints, this)
  val v2App = new V2App(isDev, acl, this)

  override lazy val assets: Assets = new controllers.Assets(loggingHttpErrorHandler, assetsMetadata)
  val router: Router = new Routes(loggingHttpErrorHandler, status, pandaAuth, v2Assets, uncachedAssets, views, faciaTool,
    pressController, defaults, faciaCapiProxy, thumbnail, front, collection, storiesVisible, vanityRedirects,
    troubleshoot, v2App)

  override lazy val httpFilters = Seq(
    new CustomGzipFilter()(materializer),
    new CORSFilter
  )
}
