package conf

object Configuration extends common.GuardianConfiguration("frontend", webappConfDirectory = "env")
object LiveContentApi extends contentapi.LiveContentApiClient
