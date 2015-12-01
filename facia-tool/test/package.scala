package test

import org.openqa.selenium.htmlunit.HtmlUnitDriver
import org.scalatest.Suites
import org.scalatestplus.play._
import play.api.test.{TestBrowser, FakeApplication}

class FaciaToolTestSuite extends Suites (
  new config.TransformationsSpec,
  new metrics.DurationMetricTest,
  new services.FaciaToolHealthcheckTest,
  new util.EnumeratorsTest,
  new util.RichFutureTest,
  new util.SanitizeInputTest,
  new tools.FaciaApiTest) with SingleServerSuite {}

trait SingleServerSuite extends OneServerPerSuite with OneBrowserPerSuite with HtmlUnitFactory {
  this: SingleServerSuite with org.scalatest.Suite =>

  implicit override lazy val app = FakeApplication(
    withGlobal = None,
    additionalConfiguration = Map(
      ("application.secret", "this_is_not_a_real_secret_just_for_tests"),
      ("ws.compressionEnabled", true)
    )
  )
}

trait ConfiguredTestSuite extends ConfiguredServer with ConfiguredBrowser {
  this: ConfiguredTestSuite with org.scalatest.Suite =>

  lazy val host = s"http://localhost:$port"
  lazy val htmlUnitDriver = webDriver.asInstanceOf[HtmlUnitDriver]
  lazy val testBrowser = TestBrowser(webDriver, None)

  protected def goTo[T](path: String)(block: TestBrowser => T): T = {
    // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
    htmlUnitDriver.setJavascriptEnabled(false)
    testBrowser.goTo(host + path)
    block(testBrowser)
  }
}
