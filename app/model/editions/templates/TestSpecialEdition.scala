package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TestSpecialEdition extends EditionDefinitionWithTemplate {
  override val title = "Specia Edition Test"
  override val subTitle = "Demonstration of special edition"
  override val edition = "special-edition-test"
  override val header = Header("Special", "Edition Test")
  override val editionType = EditionType.Special
  //override val expiry = ???
  //override val image = ???

  lazy val template = EditionTemplate(
    List(
      Front1 -> Daily(),
      Front2 -> Daily(),
      Front3 -> Daily()
    )
  )

  def Front1 = front("Front 1", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(News)

  def Front1 = front("Front 2", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(Culture)
  
  def Front3 = front("Front 3", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(Sport)

}
