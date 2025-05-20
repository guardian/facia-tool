package util

import org.scalatest.{FreeSpec, Matchers}

class ContentUpgradeTest extends FreeSpec with Matchers {

  "rewrite body" - {
    "nothing gets you nothing" in {
      val newBody = ContentUpgrade.rewriteBody("{}")
      newBody shouldBe ""
    }
    "junk gets you nothing" in {
      val body = """{"apple":"orange"}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe ""
    }
    // This test is probably wrong, and should get the original body back again.  Ask SH
    "simple response gets you very simple response" in {
      val body = """{"response":"orange"}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe """"orange""""
    }
    "complex response gets you complex response" in {
      val body = """{"response":{"orange":"apple"}}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe body
    }
    "plain results gets you plain results" in {
      val body =
        """{"response":{"other":"ignoreme","results":"this is the results"}}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe body
    }

    "object results gets you a single object" in {
      val body = """{"response":{"other":"ignoreme","results":{"a":"b"}}}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe """{"response":{"other":"ignoreme","results":{"a":"b"}}}"""
    }

    "array of value results gets you a single array of value" in {
      val body = """{"response":{"other":"ignoreme","results":["a"]}}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe """{"response":{"other":"ignoreme","results":["a"]}}"""
    }

    "array of object results gets you a single array of object" in {
      val body =
        """{"response":{"other":"ignoreme","results":[{"a":"b"}, {"b":"c"}, {"c":"d"}]}}"""
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe """{"response":{"other":"ignoreme","results":[{"a":"b"},{"b":"c"},{"c":"d"}]}}"""
    }

    "simple capi object results gets you a single upgraded object" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "test2",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags": [],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)

      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"test2",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":false,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
		  |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":false,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":false,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"news"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

    "content capi object with contributor info including cutout gets you a single upgraded object with imageCutoutReplace = true AND a cutout object" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "article",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags":[
          |        {
          |          "id": "tone/comment",
          |          "type": "Tone",
          |          "webTitle": "test7",
          |          "webUrl": "test8",
          |          "apiUrl": "test9",
          |          "references": []
          |        },
          |        {
          |          "id": "justin",
          |          "type": "contributor",
          |          "webTitle": "test10",
          |          "webUrl": "test11",
          |          "apiUrl": "test12",
          |          "references": [],
          |          "bylineImageUrl": "test13",
          |          "bylineLargeImageUrl": "cutout image location"
          |        }
          |      ],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"article",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[
          |        {
          |          "id":"tone/comment",
          |          "type":"Tone",
          |          "webTitle":"test7",
          |          "webUrl":"test8",
          |          "apiUrl":"test9",
          |          "references":[]
          |        },
          |        {
          |          "id":"justin",
          |          "type":"contributor",
          |          "webTitle":"test10",
          |          "webUrl":"test11",
          |          "apiUrl":"test12",
          |          "references":[],
          |          "bylineImageUrl":"test13",
          |          "bylineLargeImageUrl":"cutout image location"
          |        }
          |      ],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":true,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
		  |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":true,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":true,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"comment",
          |        "cutout":"cutout image location",
          |        "mediaType":"Cutout"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

    "content capi object with contributor info NOT including cutout gets you a single upgraded object with imageCutoutReplace = false and media type = UseArticleTrail" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "article",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags":[
          |        {
          |          "id": "tone/comment",
          |          "type": "Tone",
          |          "webTitle": "test7",
          |          "webUrl": "test8",
          |          "apiUrl": "test9",
          |          "references": []
          |        },
          |        {
          |          "id": "justin",
          |          "type": "contributor",
          |          "webTitle": "test10",
          |          "webUrl": "test11",
          |          "apiUrl": "test12",
          |          "references": []
          |        }
          |      ],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"article",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[
          |        {
          |          "id":"tone/comment",
          |          "type":"Tone",
          |          "webTitle":"test7",
          |          "webUrl":"test8",
          |          "apiUrl":"test9",
          |          "references":[]
          |        },
          |        {
          |          "id":"justin",
          |          "type":"contributor",
          |          "webTitle":"test10",
          |          "webUrl":"test11",
          |          "apiUrl":"test12",
          |          "references":[]
          |        }
          |      ],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":true,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
		  |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":true,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":false,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"comment",
          |        "mediaType":"UseArticleTrail"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

    "content capi object results without contributor gets you a single upgraded object with imageCutoutReplace = false and media type = UseArticleTrail" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "article",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags":[
          |        {
          |          "id": "tone/comment",
          |          "type": "Tone",
          |          "webTitle": "test7",
          |          "webUrl": "test8",
          |          "apiUrl": "test9",
          |          "references": []
          |        }
          |      ],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"article",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[
          |        {
          |          "id":"tone/comment",
          |          "type":"Tone",
          |          "webTitle":"test7",
          |          "webUrl":"test8",
          |          "apiUrl":"test9",
          |          "references":[]
          |        }
          |      ],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":true,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
		  |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":true,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":false,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"comment",
          |        "mediaType":"UseArticleTrail"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

    "content capi object results with a plural kicker from tone info, gets a plural kicker" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "article",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags":[
          |        {
          |          "id": "tone/letters",
          |          "type": "Tone",
          |          "webTitle": "Letters",
          |          "webUrl": "test8",
          |          "apiUrl": "test9",
          |          "references": []
          |        }
          |      ],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"article",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[
          |        {
          |          "id":"tone/letters",
          |          "type":"Tone",
          |          "webTitle":"Letters",
          |          "webUrl":"test8",
          |          "apiUrl":"test9",
          |          "references":[]
          |        }
          |      ],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":false,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
		  |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":false,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":false,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"letters",
          |        "pickedKicker":"Letters"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

    "content capi object results with a singular kicker from tone info, gets a plural kicker" in {
      val body =
        """
          |{"response":
          |  {"content":
          |    {
          |      "id": "test1",
          |      "type": "article",
          |      "webTitle": "test3",
          |      "webUrl": "test4",
          |      "apiUrl": "test5",
          |      "tags":[
          |        {
          |          "id": "tone/editorials",
          |          "type": "Tone",
          |          "webTitle": "Editorials",
          |          "webUrl": "test8",
          |          "apiUrl": "test9",
          |          "references": []
          |        }
          |      ],
          |      "references": [],
          |      "isHosted": true
          |    }
          |  }
          |}""".stripMargin
      val newBody = ContentUpgrade.rewriteBody(body)
      newBody shouldBe
        """
          |{"response":
          |  {"content":
          |    {
          |      "id":"test1",
          |      "type":"article",
          |      "webTitle":"test3",
          |      "webUrl":"test4",
          |      "apiUrl":"test5",
          |      "tags":[
          |        {
          |          "id":"tone/editorials",
          |          "type":"Tone",
          |          "webTitle":"Editorials",
          |          "webUrl":"test8",
          |          "apiUrl":"test9",
          |          "references":[]
          |        }
          |      ],
          |      "references":[],
          |      "isHosted":true,
          |      "frontsMeta":{
          |        "defaults":{
					|          "isImmersive":false,
          |          "boostLevel.gigaBoost":false,
          |          "isBreaking":false,
          |          "isBoosted":false,
          |          "imageHide":false,
          |          "boostLevel.default":true,
          |          "showQuotedHeadline":false,
          |          "imageSlideshowReplace":false,
          |          "boostLevel.boost":false,
          |          "imageReplace":false,
          |          "showMainVideo":false,
		  |          "videoReplace":false,
          |          "showKickerCustom":false,
          |          "showByline":false,
          |          "showKickerTag":false,
          |          "showLivePlayable":false,
          |          "imageCutoutReplace":false,
          |          "showKickerSection":false,
          |          "boostLevel.megaboost":false,
          |          "showBoostedHeadline":false},
          |        "tone":"editorial",
          |        "pickedKicker":"Editorial"
          |      }
          |    }
          |  }
          |}""".stripMargin.split("\n").map(_.trim).mkString("")
    }

  }

}
