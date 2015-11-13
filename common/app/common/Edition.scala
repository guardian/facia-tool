package common

import org.joda.time.DateTimeZone
import play.api.libs.json._
import play.api.mvc.RequestHeader

// describes the ways in which editions differ from each other
abstract class Edition(
    val id: String,
    val displayName: String,
    val timezone: DateTimeZone,
    val lang: String
  ) extends Navigation {
  def navigation: Seq[NavItem]
  def briefNav: Seq[NavItem]
}

object Edition {
  // gives templates an implicit edition
  implicit def edition(implicit request: RequestHeader): Edition = this(request)

  val defaultEdition = editions.Uk

  val all = List(
    editions.Uk,
    editions.Us,
    editions.Au
  )

  type EditionOrInternational = Either[Edition, InternationalEdition]

  implicit class RichEditionOrInternational(edition: EditionOrInternational) {
    def id = edition match {
      case Left(ed) => ed.id
      case Right(international) => InternationalEdition.id
    }

    def displayName = edition match {
      case Left(ed) => ed.displayName
      case Right(international) => InternationalEdition.displayName
    }

    def isBeta = edition.isRight
  }

  private def allWithInternational: List[EditionOrInternational] =
    all.map(Left(_)) ++ Seq(Right(InternationalEdition.international))

  lazy val editionFronts = Edition.all.map {e => "/" + e.id.toLowerCase}

  def isEditionFront(implicit request: RequestHeader): Boolean = editionFronts.contains(request.path)

  def editionId(request: RequestHeader): String = {
    // override for Ajax calls
    val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)

    // set upstream from geo location/ user preference
    val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)

    // NOTE: this only works on dev machines for local testing
    // in production no cookies make it this far
    val editionFromCookie = request.cookies.get("GU_EDITION").map(_.value.toUpperCase)

    editionFromParameter
     .orElse(editionFromHeader)
     .orElse(editionFromCookie)
     .getOrElse(Edition.defaultEdition.id)
  }

  def apply(request: RequestHeader): Edition = {
    val id = editionId(request)
    all.find(_.id == id).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[EditionOrInternational] = {
    if (InternationalEdition.isInternationalEdition(request)) {
      allWithInternational.filter(_.isLeft)
    } else {
      val currentEdition = Edition(request)
      others(currentEdition)
    }
  }

  def others(edition: Edition): Seq[EditionOrInternational] = allWithInternational.filterNot(_.left.exists(_ == edition))

  def others(id: String): Seq[EditionOrInternational] = byId(id).map(others(_)).getOrElse(Nil)

  def byId(id: String) = all.find(_.id.equalsIgnoreCase(id))

  implicit val editionWrites: Writes[Edition] = new Writes[Edition] {
    def writes(edition: Edition): JsValue = Json.obj("id" -> edition.id)
  }

  implicit val editionReads: Reads[Edition] = {
    (__ \ "id").read[String] map (Edition.byId(_).getOrElse(defaultEdition))
  }
}

case class InternationalEdition(variant: String) {
  def isControl = variant == "control"

  def isInternational = !isControl
}

object InternationalEdition {

  // These values end up in cookies and URLs
  // Make sure you know exactly what you are doing if you change them
  val id: String = "intl"
  val path: String = "/international"

  val abbreviation: String = "INT"
  val displayName = "International"

  val international = InternationalEdition("international")

  private val variants = Seq("control", "international")

  def apply(request: RequestHeader): Option[InternationalEdition] = {
    None
  }

  def isInternationalEdition(request: RequestHeader) = apply(request).exists(_.isInternational)
}

object InternationalEditionVariant {

  def apply(request: RequestHeader): Option[String] = request.headers.get("X-GU-International")

}
