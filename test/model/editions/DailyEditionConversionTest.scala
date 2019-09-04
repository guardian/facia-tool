package model.editions

import model.editions.templates.{DailyEdition, NewDailyEdition}
import org.scalatest.{FreeSpec, Matchers}

class DailyEditionConversionTest extends FreeSpec with Matchers {

  "test conversion has been done correctly" in {
    val cur = NewDailyEdition.template
    val old = DailyEdition.template
    cur.availability shouldBe old.availability
    cur.zoneId shouldBe old.zoneId
    cur.fronts.length shouldBe old.fronts.length
    val fronts = cur.fronts.zip(old.fronts)
    fronts.foreach { case ((curTemp, curPer), (oldTemp, oldPer)) =>
        curPer shouldBe oldPer
        curTemp shouldBe oldTemp
    }
  }
}
