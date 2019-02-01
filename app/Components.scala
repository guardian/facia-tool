import conf.ApplicationConfiguration
import config.{CustomGzipFilter, UpdateManager}
import controllers._
import frontsapi.model.UpdateActions
import metrics.CloudWatch
import play.api.ApplicationLoader.Context
import play.api.Mode
import play.api.routing.Router
import play.filters.cors.CORSConfig
import play.filters.cors.CORSConfig.Origins
import filters._
import router.Routes
import services._
import slices.{Containers, FixedContainers}
import thumbnails.ContainerThumbnails
import tools.FaciaApiIO
import updates.{BreakingNewsUpdate, StructuredLogger}
import util.{Acl, Encryption}

class AppComponents(context: Context) extends BaseFaciaControllerComponents(context) {
  val isTest: Boolean = context.environment.mode == Mode.Test
  val isProd: Boolean = context.environment.mode == Mode.Prod
  val isDev: Boolean = context.environment.mode == Mode.Dev
  val config = new ApplicationConfiguration(configuration, isProd)
  val awsEndpoints = new AwsEndpoints(config)
  val dynamo = new Dynamo(awsEndpoints, config)
  val acl = new Acl(permissions)
  val frontsApi = new FrontsApi(config, awsEndpoints)
  val s3FrontsApi = new S3FrontsApi(config, isTest, awsEndpoints)
  val faciaApiIO = new FaciaApiIO(frontsApi, s3FrontsApi)
  val configAgent = new ConfigAgent(config, frontsApi)
  val structuredLogger = new StructuredLogger(config, configAgent)
  val breakingNewsUpdate = new BreakingNewsUpdate(config, wsClient, structuredLogger)
  val fixedContainers = new FixedContainers(config)
  val containerThumbnails = new ContainerThumbnails(fixedContainers)
  val containers = new Containers(fixedContainers)
  val containerService = new ContainerService(containers)
  val collectionService = new CollectionService(frontsApi, containerService)
  val faciaPressQueue = new FaciaPressQueue(config)
  val faciaPress = new FaciaPress(faciaPressQueue, configAgent)
  val updateActions = new UpdateActions(faciaApiIO, frontsApi, config, configAgent, structuredLogger)
  val updateManager = new UpdateManager(updateActions, configAgent, s3FrontsApi)
  val cloudwatch = new CloudWatch(config, awsEndpoints)
  val press = new Press(faciaPress)
  val assetsManager = new AssetsManager(config, isDev)
  val encryption = new Encryption(config)
  override lazy val httpErrorHandler = new LoggingHttpErrorHandler(environment, configuration, sourceMapper, Some(router))

//  Controllers
  val collection = new CollectionController(acl, structuredLogger, updateManager, press, this)
  val defaults = new DefaultsController(acl, isDev, this)
  val faciaCapiProxy = new FaciaContentApiProxy(this)
  val faciaTool = new FaciaToolController(acl, frontsApi, collectionService, faciaApiIO, updateActions, breakingNewsUpdate,
    structuredLogger, faciaPress, faciaPressQueue, configAgent, s3FrontsApi, this)
  val front = new FrontController(acl, structuredLogger, updateManager, press, this)
  val pandaAuth = new PandaAuthController(this)
  val status = new StatusController(this)
  val storiesVisible = new StoriesVisibleController(containerService, this)
  val thumbnail = new ThumbnailController(containerThumbnails, this)
  val troubleshoot = new TroubleshootController(this)
  val uncachedAssets = new UncachedAssets(assets, this)
  val v2Assets = new V2Assets(assets)
  val vanityRedirects = new VanityRedirects(acl, this)
  val views = new ViewsController(acl, assetsManager, isDev, encryption, this)
  val pressController = new PressController(dynamo, this)
  val v2App = new V2App(isDev, acl, dynamo, this)
  val faciaToolV2 = new FaciaToolV2Controller(acl, structuredLogger, faciaPress, updateActions, configAgent, collectionService, this)
  val userDataController = new UserDataController(dynamo, this)
  val gridProxy = new GridProxy(this)
  val loggingFilter = new LoggingFilter

  final override lazy val corsConfig: CORSConfig = CORSConfig.fromConfiguration(context.initialConfiguration).copy(
    allowedOrigins = Origins.Matching(Set(config.environment.applicationUrl))
  )

  override lazy val assets: Assets = new controllers.Assets(httpErrorHandler, assetsMetadata)

  val router: Router = new Routes(httpErrorHandler, status, pandaAuth, v2Assets, uncachedAssets, views, faciaTool,
    pressController, faciaToolV2, defaults, userDataController, faciaCapiProxy, thumbnail, front, collection, storiesVisible, vanityRedirects, troubleshoot, v2App, gridProxy)


  override lazy val httpFilters = Seq(
    new CustomGzipFilter()(materializer),
    corsFilter,
    loggingFilter
  )
}
