import model.{
  FeatureSwitch,
  FeatureSwitches,
  ObscureFeed,
  PageViewDataVisualisation
}
import org.scalatest.{Matchers, WordSpec}

class FeaturesSpec extends WordSpec with Matchers {

  "FeaturesSpec" when {

    "FeatureSwitches.updateFeatureSwitchesForUser is called" must {

      "return default feature switches when user data contains no pre-existing switches" in {
        val testSwitch = ObscureFeed.copy(enabled = true)
        FeatureSwitches.updateFeatureSwitchesForUser(
          None,
          testSwitch
        ) should contain theSameElementsAs List(
          testSwitch
        ) ++ FeatureSwitches.all.filter(_.key != testSwitch.key)
      }

      "return feature switches stripped of any switches that aren't already specified" in {
        val testSwitch = FeatureSwitch("test", "test", enabled = true)
        FeatureSwitches.updateFeatureSwitchesForUser(
          None,
          testSwitch
        ) should contain theSameElementsAs FeatureSwitches.all
      }

      "return an updated list of feature switches" in {
        val unchangedSwitch = PageViewDataVisualisation
        val userDataSwitches: Option[List[FeatureSwitch]] =
          Some(List(unchangedSwitch))
        val switchToChange = ObscureFeed.copy(enabled = true)
        val remainingSwitches = FeatureSwitches.all.filter(switch =>
          !List(unchangedSwitch, switchToChange).exists(_.key == switch.key)
        )
        FeatureSwitches.updateFeatureSwitchesForUser(
          userDataSwitches,
          switchToChange
        ) should contain theSameElementsAs List(
          switchToChange,
          unchangedSwitch
        ) ++ remainingSwitches
      }

    }
  }

}
