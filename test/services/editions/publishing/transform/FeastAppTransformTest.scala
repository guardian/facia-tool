package services.editions.publishing.transform

import model.editions.{Edition, PublishAction, PublishableIssue, PublishedArticle, PublishedCollection, PublishedFront}
import org.scalatest.{FlatSpec, FreeSpec, Matchers}

import java.time.LocalDate

class FeastAppTransformTest extends FreeSpec with Matchers {
  "Transforming a PublishableIssue" in {
    val toTest = FeastAppTransform()
    val incoming = PublishableIssue(
      PublishAction.publish,
      "123456ABCD",
      Edition.FeastNorthernHemisphere,  //?? maybe a modelling mistake here
      Edition.FeastNorthernHemisphere,
      LocalDate.now(),
      "v1",
      fronts=List(
        PublishedFront("b09354b1-f971-4d08-961b-dc83004c6b1f","All Recipes",
          swatch=null,
          collections=List(
            PublishedCollection(
              id="98e89761-fdf0-4903-b49d-2af7d66fc930",
              name="Dish of the day",
              items=List(
                PublishedArticle(
                  internalPageCode = 123456,
                  null
                )
              )
            )
          )
        )
      ),
      notificationUTCOffset=0,
      topic=None
    )

    val result = toTest.transformContent(incoming)
    result.contains("all-recipes") shouldBe true
    val allRecipesFront = result("all-recipes")
    allRecipesFront.length shouldBe 1
    allRecipesFront.head.title shouldBe "Dish of the day"
    allRecipesFront.head.body shouldBe Some("") //this is just how the `body` field is currently rendered
    allRecipesFront.head.id shouldBe "98e89761-fdf0-4903-b49d-2af7d66fc930"
    allRecipesFront.head.items.length shouldBe 1
    allRecipesFront.head.items.head.asInstanceOf[FeastAppModel.Recipe].recipe.id shouldBe "123456"
  }
}
