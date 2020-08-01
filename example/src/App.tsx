import React from "react";
import { Panel } from "primereact/panel";
import "./App.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/nova-light/theme.css";
import "primeflex/primeflex.css";
import {
  RequirementsConverter,
  DefaultEntityRegistry,
} from "stripe-onboarding-schema";
import Stripe from "stripe";
import Entity from "stripe-onboarding-schema/dist/schema-core/Entity";

const entityRegistry = DefaultEntityRegistry.make();
const requirementsConverter = new RequirementsConverter(entityRegistry);

type State = {
  requirements?: string | undefined;
  requirementsType: "past_due" | "currently_due" | "eventually_due";
};

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      requirementsType: "past_due",
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
          <div className="p-col">
            <Panel header="Requirements">
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
            <Panel header="UI Schema">
              <pre>{uiSchemaJson}</pre>
            </Panel>
          </div>
          <div className="p-col">
            <Panel header="UI Form"></Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
