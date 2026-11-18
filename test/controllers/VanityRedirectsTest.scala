package controllers

import java.net.URI

import org.scalatest.{FreeSpec, Matchers}

class VanityRedirectsTest extends FreeSpec with Matchers {
  "untrailTarget" - {
    "keeps ordinary paths" in {
      VanityRedirects.untrailTarget("editorial") should be("/editorial")
    }

    "prevents open redirects to malicious sites by never producing a protocol-relative URL" in {
      val currentHost = new URI("https://facia.example/")

      Seq("/evil.com", "//evil.com").foreach { path =>
        val redirectTarget = VanityRedirects.untrailTarget(path)

        currentHost.resolve(redirectTarget) should be(new URI("https://facia.example/evil.com"))
        currentHost.resolve(redirectTarget) should not be (new URI("https://evil.com/"))
      }
    }
  }
}
