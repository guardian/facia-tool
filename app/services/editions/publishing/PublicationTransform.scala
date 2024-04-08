package services.editions.publishing

import model.editions.PublishableIssue
import play.api.libs.json.Writes

/**
 * PublicationTransform is a generic interface that takes a PublishableIssue and turns it into
 * some other shape, which must be JSON-serializable
 */
trait PublicationTransform[O] {
  def transformContent(source:PublishableIssue)(implicit evidence: Writes[O]): O
}
