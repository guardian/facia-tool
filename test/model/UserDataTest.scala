package model

import model.{
  FeatureSwitch,
  FeatureSwitches,
  ObscureFeed,
  UserData,
  UserDataForDefaults
}
import org.scalatest.{FunSuite, Matchers}

class UserDataTest extends FunSuite with Matchers {
  val testUserData = UserData(email = "hello@example.com")

  test("There are no duplicate switches when switches are changed") {
    val userWithSwitches = testUserData.copy(featureSwitches =
      Some(
        List(
          ObscureFeed.copy(enabled = !ObscureFeed.enabled)
        )
      )
    )
    UserDataForDefaults
      .fromUserData(userWithSwitches, None)
      .featureSwitches
      .get
      .length shouldEqual FeatureSwitches.all.length
  }

  test("Fills out switches that aren't present in user data") {
    val userWithSwitches = testUserData.copy(featureSwitches =
      Some(
        List(
          ObscureFeed.copy(enabled = !ObscureFeed.enabled)
        )
      )
    )
    val allSwitchKeys = FeatureSwitches.all.map(_.key)
    val userSwitchKeys = UserDataForDefaults
      .fromUserData(userWithSwitches, None)
      .featureSwitches
      .get
      .map(_.key)

    userSwitchKeys should contain allElementsOf allSwitchKeys
  }

  test("Removes features switches that aren't present in the code") {
    object BadSwitch
        extends FeatureSwitch(
          key = "bad-switch",
          title = "A switch that shouldn't be here",
          enabled = true
        )
    val userWithBadSwitch = testUserData.copy(featureSwitches =
      Some(
        List(
          BadSwitch
        )
      )
    )

    val switches = UserDataForDefaults
      .fromUserData(userWithBadSwitch, None)
      .featureSwitches
      .get
      .map(_.key)

    switches should not contain "bad-switch"
  }
}
