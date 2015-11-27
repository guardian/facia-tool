package test

import common.ExecutionContexts
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import org.scalatestplus.play._
import play.api.test._

trait ConfiguredTestSuite extends ConfiguredServer with ConfiguredBrowser with ExecutionContexts {
  this: ConfiguredTestSuite with org.scalatest.Suite =>

  lazy val host = s"http://localhost:$port"
  lazy val htmlUnitDriver = webDriver.asInstanceOf[HtmlUnitDriver]
  lazy val testBrowser = TestBrowser(webDriver, None)

  def apply[T](path: String)(block: TestBrowser => T): T = UK(path)(block)

  def UK[T](path: String)(block: TestBrowser => T): T = goTo(path)(block)

  def US[T](path: String)(block: TestBrowser => T): T = {
      val editionPath = if (path.contains("?")) s"$path&_edition=US" else s"$path?_edition=US"
      goTo(editionPath)(block)
  }

  def AU[T](path: String)(block: TestBrowser => T): T = {
    val editionPath = if (path.contains("?")) s"$path&_edition=AU" else s"$path?_edition=AU"
    goTo(editionPath)(block)
  }

  protected def goTo[T](path: String)(block: TestBrowser => T): T = {
      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      htmlUnitDriver.setJavascriptEnabled(false)
      testBrowser.goTo(host + path)
      block(testBrowser)
  }

  def withHost(path: String) = s"http://localhost:$port$path"

}

trait SingleServerSuite extends OneServerPerSuite with OneBrowserPerSuite with HtmlUnitFactory {
  this: SingleServerSuite with org.scalatest.Suite =>

  implicit override lazy val app = FakeApplication(
      withGlobal = None,
      additionalConfiguration = Map(
        ("application.secret", "this_is_not_a_real_secret_just_for_tests"),
        ("guardian.projectName", "test-project"),
        ("ws.compressionEnabled", true)
      )
  )
}

object TestRequest {
  // MOST of the time we do not care what path is set on the request - only need to override where we do
  def apply(path: String = "/does-not-matter"): FakeRequest[play.api.mvc.AnyContentAsEmpty.type] = {
    FakeRequest("GET", if (!path.startsWith("/")) s"/$path" else path)
  }
}
