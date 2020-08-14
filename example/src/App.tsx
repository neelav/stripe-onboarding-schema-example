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
import RequirementsForm, { FormValues } from "./RequirementsForm";
import OnboardingSchema from "stripe-onboarding-schema/onboarding/OnboardingSchema";

const entityRegistry = DefaultEntityRegistry.make();
const requirementsConverter = new RequirementsConverter(entityRegistry);

type State = {
  requirements?: string | undefined;
  requirementsType: RequirementsType;
  country: Country;
  formValues: FormValues;
};

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    const queryParams = new URLSearchParams(window.location.search);
    const requirementsTypeUrlParam = JSON.parse(
      queryParams.get("requirementsType") || "null"
    ) as RequirementsType | null;

    const countryUrlParam = JSON.parse(
      queryParams.get("country") || "null"
    ) as Country | null;
    const requirementsUrlParam = queryParams.get("requirements");
    const formValuesUrlParam = queryParams.get("formValues");

    this.state = {
      requirements: JSON.parse(requirementsUrlParam || "null") || undefined,
      requirementsType: requirementsTypeUrlParam
        ? requirementsTypeUrlParam
        : RequirementsType.PAST_DUE,
      country: countryUrlParam ? countryUrlParam : Country.US,
      formValues: formValuesUrlParam ? JSON.parse(formValuesUrlParam) : {},
    };
  }

  componentDidMount() {}

  render() {
    const jsonState = Object.fromEntries(
      Object.entries(this.state).map((e) => [
        e[0],
        e[1] ? JSON.stringify(e[1]) : "",
      ])
    );
    window.history.replaceState(
      {},
      "",
      "?" + new URLSearchParams(jsonState).toString()
    );
    let requirementsSchema: OnboardingSchema | undefined;
    let uiSchemaJson: string | undefined;
    if (this.state.requirements) {
      try {
        const parsedRequirements = JSON.parse(
          this.state.requirements
        ) as Stripe.Account.Requirements;

        requirementsSchema = requirementsConverter.convertRequirements(
          "acct_123abc",
          parsedRequirements,
          this.state.requirementsType
        );
      } catch (e) {}

      if (!requirementsSchema) {
        uiSchemaJson = "Invalid requirements json";
      } else {
        const fieldMap = Array.from(
          requirementsSchema.fieldMap.entries()
        ).reduce((obj: {}, [key, value]) => ({ ...obj, [key]: value }), {});

        uiSchemaJson = JSON.stringify(fieldMap, null, 2);
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
            <Panel header="3. UI Form">
              {requirementsSchema && (
                <RequirementsForm
                  schema={requirementsSchema}
                  values={this.state.formValues}
                  onChange={(formValues) =>
                    this.setState({ ...this.state, formValues })
                  }
                />
              )}
            </Panel>
          </div>
          <div className="main p-col">
            <Panel header="4. Form State">
              <pre>{JSON.stringify(this.state.formValues, undefined, 2)}</pre>
            </Panel>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
