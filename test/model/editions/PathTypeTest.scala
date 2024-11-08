package model.editions

import org.scalatest.{FunSuite, Matchers}

class PathTypeTest extends FunSuite with Matchers {

  test("should construct correct enum types") {

    PathType.withName("printSent") shouldEqual PathType.PrintSent
    PathType.withName("search") shouldEqual PathType.Search
  }

  test("should construct correct path segments form enums") {

    PathType
      .withName("printSent")
      .toPathSegment shouldEqual "content/print-sent"
    PathType.withName("search").toPathSegment shouldEqual "search"
  }

}
