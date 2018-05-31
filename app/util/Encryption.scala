package util

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util

import conf.ApplicationConfiguration
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import org.apache.commons.codec.binary.Base64

class Encryption (config: ApplicationConfiguration) {
  def encrypt (string: String): String = {
    val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
    cipher.init(Cipher.ENCRYPT_MODE, keyToSpec(config.analytics.secret))
    Base64.encodeBase64String(cipher.doFinal(string.getBytes(StandardCharsets.UTF_8)))
  }

  def keyToSpec(key: String): SecretKeySpec = {
    var keyBytes: Array[Byte] = key.getBytes(StandardCharsets.UTF_8)
    val sha: MessageDigest = MessageDigest.getInstance("SHA-1")
    keyBytes = sha.digest(keyBytes)
    keyBytes = util.Arrays.copyOf(keyBytes, 16)
    new SecretKeySpec(keyBytes, "AES")
  }
}
