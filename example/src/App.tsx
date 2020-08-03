import React from "react";
import { Panel } from "primereact/panel";
import { Dropdown } from "primereact/dropdown";
import "./App.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/nova-light/theme.css";
import "primeflex/primeflex.css";
import {
  RequirementsConverter,
  DefaultEntityRegistry,
  RequirementsType,
  Country,
} from "stripe-onboarding-schema";
import Stripe from "stripe";

const entityRegistry = DefaultEntityRegistry.make();
const requirementsConverter = new RequirementsConverter(entityRegistry);

type State = {
  requirements?: string | undefined;
  requirementsType: RequirementsType;
  country: Country;
};

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      requirementsType: RequirementsType.PAST_DUE,
      country: Country.US,
    };
  }

  render() {
    let uiSchemaJson;
    if (this.state.requirements) {
      try {
        const parsedRequirements = JSON.parse(
          this.state.requirements
        ) as Stripe.Account.Requirements;

        const schema = requirementsConverter.convertRequirements(
          parsedRequirements,
          this.state.requirementsType
        );
        const fieldMap = Array.from(schema.fieldMap.entries()).reduce(
          (obj: {}, [key, value]) => ({ ...obj, [key]: value }),
          {}
        );

        uiSchemaJson = JSON.stringify(fieldMap, null, 2);
      } catch (e) {
        uiSchemaJson = "Invalid requirements json";
      }
    }

    return (
      <div className="App">
        <div className="p-grid p-align-stretch vertical-container">
          <div className="main schema p-col p-grid p-dir-col">
            <div className="p-col">
              <Panel header="1. Requirements">
                <textarea
                  name="requirements"
                  style={{ width: "100%", height: "100%" }}
                  placeholder="Enter an account api requirements hash..."
                  value={this.state.requirements}
                  onChange={(event) =>
                    this.setState({
                      ...this.state,
                      requirements: event.target.value,
                    })
                  }
                ></textarea>
              </Panel>
            </div>
            <div className="p-col">
              <div className="p-panel p-component">
                <div className="p-panel-titlebar">
                  <span className="p-panel-title">2. UI Schema</span>
                  <Dropdown
                    placeholder="Requirements Type"
                    value={this.state.requirementsType}
                    options={Object.values(RequirementsType).map((v) => ({
                      label: v,
                      value: v,
                    }))}
                    style={{ marginLeft: 10 }}
                    onChange={(event) =>
                      this.setState({
                        ...this.state,
                        requirementsType: event.target.value,
                      })
                    }
                  />
                  <Dropdown
                    placeholder="Country"
                    value={this.state.country}
                    options={Object.values(Country).map((v) => ({
                      label: v,
                      value: v,
                    }))}
                    style={{ marginLeft: 10 }}
                    onChange={(event) =>
                      this.setState({
                        ...this.state,
                        country: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-panel-content">
                  <pre>{uiSchemaJson}</pre>
                </div>
              </div>
            </div>
          </div>
          <div className="main p-col">
            <Panel header="3. UI Form"></Panel>
          </div>
          <div className="main p-col">
            <Panel header="4. Output"></Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
