package services

import com.gu.facia.client.models._
import com.gu.pandomainauth.model.User
import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers, OptionValues}

class CustomSubnavConfigFunctionsTest
    extends FreeSpec
    with Matchers
    with OptionValues {

  private val epoch = new DateTime(0)

  private def subnav(
      id: String,
      headerText: String = "Header",
      pages: List[TargetedPage] = Nil
  ): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader(headerText, None, "Copy"),
      format = CustomSubnavFormat.Large,
      links = Nil,
      pages = pages,
      images = None,
      palette = None,
      lastUpdated = epoch,
      updatedBy = "Ada Lovelace",
      updatedEmail = "ada@example.com"
    )

  import CustomSubnavConfigFunctions._

  private val emptyConfig = CustomSubnavConfigFunctions.empty

  "upsertDraft" - {
    "adds a brand-new subnav to draft, leaving live untouched" in {
      val result = upsertDraft(emptyConfig, subnav("abc"))
      result.draft.map(_.id) should be(List("abc"))
      result.live should be(emptyConfig.live)
    }

    "updates an existing draft entry in place (no duplicates, order preserved)" in {
      val config =
        CustomSubnavConfig(live = Nil, draft = List(subnav("a"), subnav("b")))
      val result = upsertDraft(config, subnav("a", headerText = "Changed"))
      result.draft.map(_.id) should be(List("a", "b"))
      result.draft.find(_.id == "a").map(_.header.headerText) should be(
        Some("Changed")
      )
    }

    "does not affect other subnavs when editing one" in {
      val config = CustomSubnavConfig(
        live = List(subnav("xyz")),
        draft = List(subnav("xyz"))
      )
      val result = upsertDraft(config, subnav("abc", headerText = "New"))
      result.draft.map(_.id).sorted should be(List("abc", "xyz"))
      result.live.map(_.id) should be(List("xyz"))
    }

    "collapses the draft entry when it is content-identical to live (ignoring audit fields)" in {
      val live = subnav("abc", headerText = "Same")
      val config = CustomSubnavConfig(live = List(live), draft = Nil)
      // same content but different audit stamp
      val incoming =
        live.copy(lastUpdated = DateTime.now, updatedBy = "Someone Else")
      val result = upsertDraft(config, incoming)
      result.draft should be(Nil)
    }

    "keeps the draft entry when it differs in content from live" in {
      val config = CustomSubnavConfig(
        live = List(subnav("abc", headerText = "Old")),
        draft = Nil
      )
      val result = upsertDraft(config, subnav("abc", headerText = "New"))
      result.draft.map(_.header.headerText) should be(List("New"))
    }
  }

  "publish" - {
    "promotes a new draft subnav into live and removes it from draft" in {
      val config =
        CustomSubnavConfig(live = Nil, draft = List(subnav("abc")))
      val result = publish(config, "abc").value
      result.live.map(_.id) should be(List("abc"))
      result.draft should be(Nil)
    }

    "replaces the matching live entry in place, preserving position" in {
      val config = CustomSubnavConfig(
        live = List(subnav("a"), subnav("b", headerText = "Old")),
        draft = List(subnav("b", headerText = "New"))
      )
      val result = publish(config, "b").value
      result.live.map(_.id) should be(List("a", "b"))
      result.live.find(_.id == "b").map(_.header.headerText) should be(
        Some("New")
      )
      result.draft should be(Nil)
    }

    "returns None when the id is not in draft" in {
      val config = CustomSubnavConfig(live = List(subnav("a")), draft = Nil)
      publish(config, "missing") should be(None)
    }
  }

  "discard" - {
    "removes only the given id from draft, leaving live and other drafts intact" in {
      val config = CustomSubnavConfig(
        live = List(subnav("a")),
        draft = List(subnav("a", headerText = "Edited"), subnav("b"))
      )
      val result = discard(config, "a").value
      result.draft.map(_.id) should be(List("b"))
      result.live.map(_.id) should be(List("a"))
    }

    "returns None when the id has no draft entry" in {
      val config = CustomSubnavConfig(live = List(subnav("a")), draft = Nil)
      discard(config, "a") should be(None)
    }
  }

  "unpublish" - {
    "moves a published subnav into draft and removes it from live" in {
      val config =
        CustomSubnavConfig(live = List(subnav("abc")), draft = Nil)
      val result = unpublish(config, "abc").value
      result.live should be(Nil)
      result.draft.map(_.id) should be(List("abc"))
    }

    "overwrites any pending draft edits with the live copy (option b)" in {
      val config = CustomSubnavConfig(
        live = List(subnav("abc", headerText = "Live")),
        draft = List(subnav("abc", headerText = "Pending edit"))
      )
      val result = unpublish(config, "abc").value
      result.live should be(Nil)
      result.draft.map(_.header.headerText) should be(List("Live"))
    }

    "does not affect other subnavs" in {
      val config = CustomSubnavConfig(
        live = List(subnav("abc"), subnav("xyz")),
        draft = Nil
      )
      val result = unpublish(config, "abc").value
      result.live.map(_.id) should be(List("xyz"))
      result.draft.map(_.id) should be(List("abc"))
    }

    "returns None when the id is not live" in {
      val config = CustomSubnavConfig(live = Nil, draft = List(subnav("abc")))
      unpublish(config, "abc") should be(None)
    }
  }

  "delete" - {
    "removes the id from both live and draft" in {
      val config = CustomSubnavConfig(
        live = List(subnav("abc"), subnav("xyz")),
        draft = List(subnav("abc", headerText = "Edited"))
      )
      val result = delete(config, "abc").value
      result.live.map(_.id) should be(List("xyz"))
      result.draft should be(Nil)
    }

    "returns None when the id is absent" in {
      val config = CustomSubnavConfig(live = List(subnav("a")), draft = Nil)
      delete(config, "missing") should be(None)
    }
  }
}
