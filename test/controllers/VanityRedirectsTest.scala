package controllers

import java.net.URI

import org.scalatest.{FreeSpec, Matchers}

class VanityRedirectsTest extends FreeSpec with Matchers {
  "untrailTarget" - {
    "keeps ordinary paths" in {
      VanityRedirects.untrailTarget("editorial") should be("/editorial")
    }

    "prevents open redirects to malicious sites by never producing a protocol-relative URL" in {
      VanityRedirects.untrailTarget("/evil.com") should be("/evil.com")
      val currentHost = new URI("https://facia.example/")
      val redirectTarget = VanityRedirects.untrailTarget("//evil.com")

      currentHost.resolve(redirectTarget) should be(new URI("https://facia.example/evil.com"))
      currentHost.resolve(redirectTarget) should not be (new URI("https://evil.com/"))
    }
  }
}
