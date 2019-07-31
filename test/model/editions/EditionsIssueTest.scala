package model.editions

import org.scalatest.{FreeSpec, Matchers}

class EditionsIssueTest extends FreeSpec with Matchers {
  "EditionsIssueTest" - {
    "test serialisation into a preview issue" in {
      val issue: EditionsIssue = ???

      val expected =
        """
          |
        """.stripMargin

      val previewIssue = issue.toPublishedIssue()

      previewIssue should be(expected)
    }

    "test serialisation into a published issue" in {
      val issue: EditionsIssue = ???

      val expected =
        """
          |
        """.stripMargin

      val publishedIssue = issue.toPublishedIssue(Some("foo"))

      publishedIssue should be(expected)
    }
  }
}
