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
import Field, { Container } from "stripe-onboarding-schema/schema-core/Field";
import FieldBundle from "stripe-onboarding-schema/schema-core/FieldBundle";

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
        {this.entitySection(this.props.schema, EntityType.PERSON)}
        {this.entitySection(this.props.schema, EntityType.UNKNOWN)}
      </div>
    );
  }

  entitySection(schema: OnboardingSchema, entity: EntityType): ReactFragment {
    switch (entity) {
      case EntityType.ACCOUNT:
      case EntityType.PERSON:
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
    const formElements = (requirements || []).map((r) => {
      const field = r.field;
      if (field instanceof FieldBundle) {
        return this.makeBundleElement(r, field);
      }
      return this.makeRequirementContainer(r, field);
    });
    return <React.Fragment>{formElements}</React.Fragment>;
  }

  makeRequirementContainer(
    requirement: Requirement,
    field: Field<any, any>
  ): ReactElement {
    return (
      <div key={field.id} className="p-field p-grid">
        <label>
          <div
            className="p-col"
            style={{ width: "100px", overflowWrap: "anywhere" }}
          >
            {field.name}
          </div>
          {this.makeRequirementElement(requirement, field)}
        </label>
      </div>
    );
  }

  makeRequirementElement(
    requirement: Requirement,
    field: Field<any, any>
  ): ReactElement {
    let container;
    let value: any;
    let setValueFn = (value: any) => {
      const newFormValues = { ...this.props.values };
      newFormValues[requirement.entityType] =
        newFormValues[requirement.entityType] || {};

      const container =
        newFormValues[requirement.entityType][
          requirement.entityToken || "__NEW__"
        ] || {};

      newFormValues[requirement.entityType][
        requirement.entityToken || "__NEW__"
      ] = container;
      RequirementsConverter.setValue(field, container, value).then(() => {
        this.props.onChange(newFormValues);
      });
    };

    container = (this.props.values[requirement.entityType] || {})[
      requirement.entityToken || "__NEW__"
    ];
    value = RequirementsConverter.getValue(field, container || {}) || "";

    let attributes;
    switch (field.fieldType) {
      case FieldType.TEXT:
        attributes = field.attributes as TextAttributes;
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
        attributes = field.attributes as EnumAttributes;
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

  makeBundleElement(
    requirement: Requirement,
    bundle: FieldBundle<any>
  ): ReactElement {
    return (
      <React.Fragment key={bundle.id}>
        {bundle.fields.map((f) =>
          this.makeRequirementContainer(requirement, f)
        )}
      </React.Fragment>
    );
  }
}

export default RequirementsForm;
