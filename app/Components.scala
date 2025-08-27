import com.amazonaws.auth.AWSCredentialsProvider
import software.amazon.awssdk.regions.{Region => WeirdRegion}
import com.amazonaws.services.sns.AmazonSNSClient
import software.amazon.awssdk.auth.credentials.{
  AwsCredentials,
  AwsCredentialsProvider,
  AwsCredentialsProviderChain,
  DefaultCredentialsProvider,
  ProfileCredentialsProvider
}
import conf.ApplicationConfiguration
import config.{CustomGzipFilter, UpdateManager}
import controllers._
import frontsapi.model.UpdateActions
import metrics.CloudWatch
import play.api.ApplicationLoader.Context
import play.api.Mode
import play.api.db.{DBComponents, HikariCPComponents}
import play.api.db.evolutions.EvolutionsComponents
import play.api.routing.Router
import play.filters.cors.CORSConfig
import play.filters.cors.CORSConfig.Origins
import filters._
import model.editions.{EditionsAppTemplates, FeastAppTemplates}
import router.Routes
import services._
import services.editions.EditionsTemplating
import services.editions.db.EditionsDB
import services.editions.publishing.events.PublishEventsListener
import services.editions.publishing.{
  EditionsAppPublicationTarget,
  FeastPublicationTarget,
  Publishing
}
import slices.{Containers, FixedContainers}
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import thumbnails.ContainerThumbnails
import tools.FaciaApiIO
import updates.{BreakingNewsUpdate, StructuredLogger}
import util.{Acl, TimestampGenerator}
import services.editions.publishing.PublishedIssueFormatters._

class AppComponents(context: Context, val config: ApplicationConfiguration)
    extends BaseFaciaControllerComponents(context)
    with EvolutionsComponents
    with DBComponents
    with HikariCPComponents {

  applicationEvolutions

  val isDev: Boolean = context.environment.mode == Mode.Dev
  val isTest: Boolean = context.environment.mode == Mode.Test
  val isProd: Boolean = context.environment.mode == Mode.Prod

  // Services
  val awsEndpoints = new AwsEndpoints(config)
  val capi = new GuardianCapi(config)
  val ophan = new GuardianOphan(config)

  val oldAwsCredentials: AWSCredentialsProvider =
    config.aws.cmsFrontsAccountCredentials
  val newAwsCredentials: AwsCredentialsProvider =
    config.aws.newStyleCmsFrontsAccountCredentials

  // Scala 2.13 requires a version of Scanamo which requires the 'new' Amazon AWS SDK.
  // This means we have two different SDKs for AWS in the build, which is unideal
  // but should not lead to problems.
  // TODO Upversion the rest of the AWS SDK code!
  val dynamo: DynamoDbClient = DynamoDbClient
    .builder()
    .credentialsProvider(newAwsCredentials)
    .region(WeirdRegion.of(config.aws.region))
    .build()
  val s3Client = S3.client(oldAwsCredentials, config.aws.region)
  val snsClient = AmazonSNSClient
    .builder()
    .withCredentials(oldAwsCredentials)
    .withRegion(config.aws.region)
    .build()
  val acl = new Acl(permissions)

  // Editions services
  val editionsDb = new EditionsDB(
    config.postgres.url,
    config.postgres.user,
    config.postgres.password
  )
  val templating = new EditionsTemplating(
    EditionsAppTemplates.templates ++ FeastAppTemplates.templates,
    capi,
    ophan
  )
  val publishingBucket = new EditionsAppPublicationTarget(
    s3Client,
    config.aws.publishedEditionsIssuesBucket
  )
  val previewBucket = new EditionsAppPublicationTarget(
    s3Client,
    config.aws.previewEditionsIssuesBucket
  )
  val feastPublicationTarget =
    new FeastPublicationTarget(snsClient, config, TimestampGenerator())
  val editionsPublishing = new Publishing(
    publishingBucket,
    previewBucket,
    feastPublicationTarget,
    editionsDb
  )
  PublishEventsListener.apply(config, editionsDb).start

  // Controllers
  val frontsApi = new FrontsApi(config, awsEndpoints)
  val s3FrontsApi = new S3FrontsApi(config, isTest, awsEndpoints)
  val faciaApiIO = new FaciaApiIO(frontsApi, s3FrontsApi)
  val configAgent = new ConfigAgent(config, frontsApi)
  val structuredLogger = new StructuredLogger(config, configAgent)
  val breakingNewsUpdate =
    new BreakingNewsUpdate(config, wsClient, structuredLogger)
  val fixedContainers = new FixedContainers(config)
  val containerThumbnails = new ContainerThumbnails(fixedContainers)
  val containers = new Containers(fixedContainers)
  val containerService = new ContainerService(containers, frontsApi)
  val collectionService = new CollectionService(frontsApi, containerService)
  val faciaPressTopic = new FaciaPressTopic(config)
  val faciaPress = new FaciaPress(faciaPressTopic, configAgent)
  val updateActions = new UpdateActions(
    faciaApiIO,
    frontsApi,
    config,
    configAgent,
    structuredLogger
  )
  val updateManager = new UpdateManager(updateActions, configAgent, s3FrontsApi)
  val cloudwatch = new CloudWatch(config, awsEndpoints)
  val press = new Press(faciaPress)
  val assetsManager = new AssetsManager(config, isDev)
  override lazy val httpErrorHandler = new LoggingHttpErrorHandler(
    environment,
    configuration,
    devContext.map(_.sourceMapper),
    Some(router)
  )

//  Controllers
  val editions = new EditionsController(
    editionsDb,
    templating,
    editionsPublishing,
    capi,
    this
  )
  val collection =
    new CollectionController(acl, structuredLogger, updateManager, press, this)
  val defaults = new DefaultsController(acl, isDev, this)
  val faciaCapiProxy = new FaciaContentApiProxy(capi, this)
  val faciaTool = new FaciaToolController(
    acl,
    frontsApi,
    collectionService,
    faciaApiIO,
    updateActions,
    breakingNewsUpdate,
    structuredLogger,
    faciaPress,
    faciaPressTopic,
    configAgent,
    s3FrontsApi,
    this
  )
  val front =
    new FrontController(acl, structuredLogger, updateManager, press, this)
  val pandaAuth = new PandaAuthController(this)
  val status = new StatusController(this)
  val storiesVisible = new StoriesVisibleController(containerService, this)
  val thumbnail = new ThumbnailController(containerThumbnails, this)
  val troubleshoot = new TroubleshootController(this)
  val v1Assets = new V1Assets(assets, this)
  val v2Assets = new V2Assets(assets)
  val vanityRedirects = new VanityRedirects(acl, this)
  val views = new ViewsController(acl, assetsManager, isDev, this)
  val pressController = new PressController(dynamo, this)
  val v2App = new V2App(isDev, acl, dynamo, editionsDb, this)
  val faciaToolV2 = new FaciaToolV2Controller(
    acl,
    structuredLogger,
    faciaPress,
    updateActions,
    configAgent,
    collectionService,
    faciaApiIO,
    this
  )
  val userDataController = new UserDataController(frontsApi, dynamo, this)
  val gridProxy = new GridProxy(this)
  val loggingFilter = new LoggingFilter

  final override lazy val corsConfig: CORSConfig = CORSConfig
    .fromConfiguration(context.initialConfiguration)
    .copy(
      allowedOrigins = Origins.Matching(Set(config.environment.applicationUrl))
    )

  override lazy val assets: Assets =
    new controllers.Assets(httpErrorHandler, assetsMetadata, environment)

  val router: Router = new Routes(
    httpErrorHandler,
    status,
    pandaAuth,
    v2Assets,
    v1Assets,
    views,
    faciaTool,
    pressController,
    faciaToolV2,
    defaults,
    userDataController,
    faciaCapiProxy,
    thumbnail,
    front,
    collection,
    storiesVisible,
    vanityRedirects,
    troubleshoot,
    v2App,
    gridProxy,
    editions
  )

  override lazy val httpFilters = Seq(
    new CustomGzipFilter()(materializer),
    corsFilter,
    loggingFilter
  )
}
