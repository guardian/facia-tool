package controllers

import org.scalatest.{FreeSpec, Matchers}

class VanityRedirectsTest extends FreeSpec with Matchers {
  "untrailTarget" - {
    "keeps ordinary paths" in {
      VanityRedirects.untrailTarget("editorial") should be("/editorial")
    }

    "does not produce a protocol-relative URL" in {
      VanityRedirects.untrailTarget("/evil.com") should be("/evil.com")
      VanityRedirects.untrailTarget("//evil.com") should be("/evil.com")
    }
  }
}
