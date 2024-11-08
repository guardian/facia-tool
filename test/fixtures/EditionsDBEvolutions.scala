package fixtures

import org.scalatest.{BeforeAndAfter, Suite}
import play.api.db.Database
import play.api.db.evolutions.{Evolutions, InconsistentDatabase}

trait EditionsDBEvolutions extends BeforeAndAfter { self: Suite =>
  def database: Database

  before {
    try {
      Evolutions.applyEvolutions(database)
    } catch {
      case fail: InconsistentDatabase =>
        println(fail.subTitle)
        throw fail
    }
  }

  after {
    Evolutions.cleanupEvolutions(database)
  }
}
