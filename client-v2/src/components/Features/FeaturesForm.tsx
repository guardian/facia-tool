import React from 'react';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';

class FeaturesForm extends React.Component {


  public render() {
    return (
      <form>
        <InputCheckboxToggle
          label="Use inline form for card overrides"
          id="use-inline-form"
          input={{ onChange: this.handleChange }}
        />
      </form>
    );
  }

  private handleChange() {

  }
}

export default FeaturesForm;
