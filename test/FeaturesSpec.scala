import model.{FeatureSwitch, FeatureSwitches, InlineForm }
import org.scalatest.{Matchers, WordSpec}

class FeaturesSpec extends WordSpec with Matchers {

  "FeaturesSpec" when {

    "FeatureSwitches.updateFeatureSwitchesForUser is called" must {

      "return default feature switches when user data contains no pre-existing switches" in {
        val testSwitch = FeatureSwitch("test","test", enabled = true)
        FeatureSwitches.updateFeatureSwitchesForUser(None, testSwitch) should contain theSameElementsAs List(InlineForm, testSwitch)
      }

      "return an updated list of feature switches" in {
        val unchangedSwitch = FeatureSwitch("test","test", enabled = true)
        val switchToChange = InlineForm
        val userDataSwitches: Option[List[FeatureSwitch]] = Some(List(switchToChange, unchangedSwitch))

        FeatureSwitches.updateFeatureSwitchesForUser(userDataSwitches, switchToChange) should contain theSameElementsAs List(switchToChange, unchangedSwitch)
      }

    }
  }

}
