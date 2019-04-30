package util

import com.gu.facia.client.models.{ConfigJson => Config, FrontJson => Front}
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class SanitizeInputTest extends FlatSpec with Matchers {

  private def createConfigWithFront(section: Option[String] = None,
                                    title: Option[String] = None,
                                    webTitle: Option[String] = None,
                                    description: Option[String] = None,
                                    onPageDescription: Option[String] = None,
                                    priority: Option[String] = None,
                                    isHidden: Option[Boolean] = None) = Config(
    Map("uk" -> Front(Nil, section, webTitle, title, description, onPageDescription, None, None, None, None, priority, isHidden, None, None)),
    Map.empty)

  "StripTags" should "strip tag from title" in {
    val config = createConfigWithFront(title = Option("<strip><me>now"))
    SanitizeInput.sanitizeConfig(config).fronts("uk").title.get should be("now")
  }

  it should "strip tag from webTitle" in {
    val config = createConfigWithFront(webTitle = Option("a<strip>b</me>c"))
    SanitizeInput.sanitizeConfig(config).fronts("uk").webTitle.get should be("abc")
  }

  it should "strip tag from description" in {
    val config = createConfigWithFront(description = Option("<strip><me>"))
    SanitizeInput.sanitizeConfig(config).fronts("uk").description.get should be("")
  }

  it should "strip tag from section" in {
    val config = createConfigWithFront(section = Option("<strip>hello<me>"))
    SanitizeInput.sanitizeConfig(config).fronts("uk").navSection.get should be("hello")
  }

  it should "strip empty brackets regex" in {
    SanitizeInput.fromString("a<>b") should be("ab")
  }

  it should "strip tag with attributes" in {
    SanitizeInput.fromString( """<strip href="stuff.jpg">hello<me>""") should be("hello")
  }

  it should "strip unclosed tag" in {
    SanitizeInput.fromString("a<script") should be("a")
  }

  it should "ensure a front with edition priority is always hidden" in {
    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("edition"), isHidden = Some(true))
    ).fronts("uk").isHidden.get should be(true)

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("edition"), isHidden = Some(false))
    ).fronts("uk").isHidden.get should be(true)

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("edition"))
    ).fronts("uk").isHidden.get should be(true)
  }

  it should "ensure a front with training priority is always hidden" in {
    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("training"), isHidden = Some(true))
    ).fronts("uk").isHidden.get should be(true)

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("training"), isHidden = Some(false))
    ).fronts("uk").isHidden.get should be(true)

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("training"))
    ).fronts("uk").isHidden.get should be(true)
  }

  it should "not edit hidden values for other priorities" in {
    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("editorial"), isHidden = Some(true))
    ).fronts("uk").isHidden should be(Some(true))

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("editorial"), isHidden = Some(false))
    ).fronts("uk").isHidden.get should be(false)

    SanitizeInput.sanitizeConfig(
      createConfigWithFront(priority = Some("editorial"))
    ).fronts("uk").isHidden should be(None)
  }
}
