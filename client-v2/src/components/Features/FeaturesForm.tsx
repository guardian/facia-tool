import React from 'react';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { selectAllFeatures } from 'shared/redux/modules/featureSwitches/selectors';
import { FeatureSwitch } from 'types/Features';
import { Dispatch } from 'types/Store';
import { actionSetFeatureValue } from 'shared/redux/modules/featureSwitches';
import { saveFeatureSwitch } from 'services/userDataApi';
import { selectSharedState } from 'shared/selectors/shared';

interface Props {
  featureSwitches: FeatureSwitch[];
  setFeatureValue: (featureSwitch: FeatureSwitch) => void;
}

class FeaturesForm extends React.Component<Props> {
  public render() {
    const { featureSwitches } = this.props;
    return (
      <form>
        {featureSwitches.map(featureSwitch => (
          <InputCheckboxToggle
            key={featureSwitch.key}
            label={featureSwitch.title}
            id={featureSwitch.key}
            input={{
              onChange: () => this.handleChange(featureSwitch),
              checked: featureSwitch.enabled
            }}
          />
        ))}
      </form>
    );
  }

  private handleChange(featureSwitch: FeatureSwitch) {
    const newFeatureSwitch = {
      ...featureSwitch,
      enabled: !featureSwitch.enabled
    };
    this.props.setFeatureValue(newFeatureSwitch);
    saveFeatureSwitch(newFeatureSwitch);
  }
}

const mapStateToProps = (state: State) => ({
  featureSwitches: selectAllFeatures(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFeatureValue: (featureSwitch: FeatureSwitch) =>
    dispatch(actionSetFeatureValue(featureSwitch))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturesForm);
