package util

import java.time.Instant

trait TimestampGenerator {
  def getTimestamp: Long
}

class TimestampGeneratorImpl extends TimestampGenerator {
  def getTimestamp = Instant.now().toEpochMilli
}

object TimestampGenerator {
  def apply() = new TimestampGeneratorImpl()
}
