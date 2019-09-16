package services.editions

import play.api.libs.json.{Format, Json}

package object publishing {

  case class IssuePublishedEvent(status: String, message: String)

  case class IssuePublishedEventWrapper(event: IssuePublishedEvent)

  case class SQSMessageBody(Type: String, MessageId: String, TopicArn: String, Message: String, Timestamp: String, SignatureVersion: String, Signature: String, SigningCertURL: String, UnsubscribeURL: String)

  object IssuePublishedSQSMsgFormatter {
    implicit val issuePublishedEventFormat: Format[IssuePublishedEvent] = Json.format[IssuePublishedEvent]
    implicit val issuePublishedEventWrapperFormat: Format[IssuePublishedEventWrapper] = Json.format[IssuePublishedEventWrapper]
    implicit val sqsMsgBody: Format[SQSMessageBody] = Json.format[SQSMessageBody]
  }

}
