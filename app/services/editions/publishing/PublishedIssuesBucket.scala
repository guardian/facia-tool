package services.editions.publishing

import java.time.OffsetDateTime

import com.amazonaws.services.s3.AmazonS3
import com.gu.editions.PublishedIssue
import com.gu.pandomainauth.model.User

class PublishedIssuesBucket(s3Client: AmazonS3, bucketName: String) extends EditionsBucket[User](s3Client, bucketName) {
  override def createIssueFilename(issue: PublishedIssue, publicationMetadata: User): String = {
    val firstName = publicationMetadata.firstName.replace(" ", "_")
    val lastName = publicationMetadata.lastName.replace(" ", "_")
    s"${OffsetDateTime.now().toString}_${firstName}_$lastName.json"
  }
}
