package util

import com.gu.pandomainauth.model.User

object UserUtil {
  def getDisplayName(user: User) = s"${user.firstName} ${user.lastName}"
}
