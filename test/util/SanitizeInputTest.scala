package util

import com.gu.facia.client.models.{ConfigJson => Config, FrontJson => Front}
import org.scalatest.{FlatSpec, Matchers}

class SanitizeInputTest extends FlatSpec with Matchers {

  private def createConfigWithFront(
      section: Option[String] = None,
      title: Option[String] = None,
      webTitle: Option[String] = None,
      description: Option[String] = None,
      onPageDescription: Option[String] = None
  ) = Config(
    Map(
      "uk" -> Front(
        Nil,
        section,
        webTitle,
        title,
        description,
        onPageDescription,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None
      )
    ),
    Map.empty
  )

  "StripTags" should "strip tag from title" in {
    val config = createConfigWithFront(title = Option("<strip><me>now"))
    SanitizeInput.fromConfigSeo(config).fronts("uk").title.get should be("now")
  }

  it should "strip tag from webTitle" in {
    val config = createConfigWithFront(webTitle = Option("a<strip>b</me>c"))
    SanitizeInput.fromConfigSeo(config).fronts("uk").webTitle.get should be(
      "abc"
    )
  }

  it should "strip tag from description" in {
    val config = createConfigWithFront(description = Option("<strip><me>"))
    SanitizeInput.fromConfigSeo(config).fronts("uk").description.get should be(
      ""
    )
  }

  it should "strip tag from section" in {
    val config = createConfigWithFront(section = Option("<strip>hello<me>"))
    SanitizeInput.fromConfigSeo(config).fronts("uk").navSection.get should be(
      "hello"
    )
  }

  it should "strip empty brackets regex" in {
    SanitizeInput.fromString("a<>b") should be("ab")
  }

  it should "strip tag with attributes" in {
    SanitizeInput.fromString("""<strip href="stuff.jpg">hello<me>""") should be(
      "hello"
    )
  }

  it should "strip unclosed tag" in {
    SanitizeInput.fromString("a<script") should be("a")
  }
}
