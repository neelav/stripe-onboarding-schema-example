import React, { ReactFragment, ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  OnboardingSchema,
  EntityType,
  Requirement,
  RequirementsConverter,
} from "stripe-onboarding-schema";
import { assertNever } from "./util";
import "primeicons/primeicons.css";
import "primereact/resources/themes/nova-light/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import FieldType from "stripe-onboarding-schema/schema-core/fieldtypes/FieldType";
import { Dropdown } from "primereact/dropdown";
import EnumAttributes from "stripe-onboarding-schema/schema-core/fieldtypes/EnumAttributes";
import TextAttributes, {
  TextType,
} from "stripe-onboarding-schema/schema-core/fieldtypes/TextAttributes";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Container } from "stripe-onboarding-schema/schema-core/Field";

export type FormValues = {
  [key: string]: {
    [key: string]: Container;
  };
};

type Props = {
  schema: OnboardingSchema;
  values: FormValues;
  onChange: (values: FormValues) => void;
};

type State = {
  resolvedValues: { [ley: string]: any };
};

class RequirementsForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      resolvedValues: {},
    };
  }

  render() {
    return (
      <div>
        {this.entitySection(this.props.schema, EntityType.ACCOUNT)}
        {this.entitySection(this.props.schema, EntityType.UNKNOWN)}
      </div>
    );
  }

  entitySection(schema: OnboardingSchema, entity: EntityType): ReactFragment {
    switch (entity) {
      case EntityType.ACCOUNT:
      case EntityType.UNKNOWN:
        return (
          <React.Fragment>
            <h3>{entity}</h3>
            {this.formSection(EntityType.ACCOUNT, schema.fieldMap.get(entity))}
          </React.Fragment>
        );
      default:
        assertNever(entity);
    }
  }

  formSection(
    entityType: EntityType,
    requirements: Requirement[] | undefined
  ): ReactFragment {
    const formElements = (requirements || []).map((r) => (
      <div key={r.field.id} className="p-field p-grid">
        <label>
          <div
            className="p-col"
            style={{ width: "100px", overflowWrap: "anywhere" }}
          >
            {r.field.name}
          </div>
          {this.makeRequirementElement(r)}
        </label>
      </div>
    ));
    return <React.Fragment>{formElements}</React.Fragment>;
  }

  makeRequirementElement(requirement: Requirement): ReactElement {
    let container;
    let value;
    let setValueFn = (value: any) => {
      const newFormValues = { ...this.props.values };
      newFormValues[requirement.entityType] =
        newFormValues[requirement.entityType] || {};

      const container =
        newFormValues[requirement.entityType][requirement.entityToken] || {};

      newFormValues[requirement.entityType][
        requirement.entityToken
      ] = container;
      RequirementsConverter.setValue(requirement.field, container, value).then(
        () => {
          this.props.onChange(newFormValues);
        }
      );
    };

    container = (this.props.values[requirement.entityType] || {})[
      requirement.entityToken
    ];
    value =
      RequirementsConverter.getValue(requirement.field, container || {}) || "";

    let attributes;
    switch (requirement.field.fieldType) {
      case FieldType.TEXT:
        attributes = requirement.field.attributes as TextAttributes;
        let component;
        switch (attributes.type) {
          case TextType.SHORT:
            component = (
              <InputText
                value={value}
                onChange={(event) => setValueFn(event.currentTarget.value)}
              />
            );
            break;
          case TextType.LONG:
            component = (
              <InputTextarea
                value={value}
                onChange={(event) => setValueFn(event.currentTarget.value)}
              />
            );
            break;
          default:
            assertNever(attributes.type);
        }
        return component;
      case FieldType.ENUM:
        attributes = requirement.field.attributes as EnumAttributes;
        return (
          <Dropdown
            options={attributes.values}
            value={value}
            onChange={(event) => setValueFn(event.value)}
          />
        );
      case FieldType.PHONE:
        return (
          <PhoneInput
            placeholder="Enter phone number"
            value={value}
            onChange={(value) => setValueFn(value)}
          />
        );
      case FieldType.URL:
      case FieldType.EMAIL:
        return (
          <InputText
            value={value}
            onChange={(event) => setValueFn(event.currentTarget.value)}
          />
        );
      default:
        return <span>{requirement.requirementId}</span>;
    }
  }
}

export default RequirementsForm;
