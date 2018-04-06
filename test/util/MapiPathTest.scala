package util

import controllers.EmailController
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class MapiPathTest extends FlatSpec with Matchers {
  it should "construct mapi front paths correctly" in {
    EmailController.buildMapiPath("uk/film") should be("uk/fronts/film")
    EmailController.buildMapiPath("uk") should be("uk/fronts/home")
    EmailController.buildMapiPath("audio") should be("uk/fronts/audio")
  }
}
