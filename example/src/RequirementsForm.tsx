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
import DateAttributes, {
  DateType,
} from "stripe-onboarding-schema/schema-core/fieldtypes/DateAttributes";
import TextAttributes, {
  TextType,
} from "stripe-onboarding-schema/schema-core/fieldtypes/TextAttributes";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import Field, { Params } from "stripe-onboarding-schema/schema-core/Field";
import FieldBundle from "stripe-onboarding-schema/schema-core/FieldBundle";
import Address from "./Address";
import DateOfBirth from "./DateOfBirth";

export type FormValues = {
  [key: string]: {
    [key: string]: Params;
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
            style={{ minWidth: "100px", overflowWrap: "anywhere" }}
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
    let params;
    let value: any;
    let setValueFn = (value: any) => {
      const newFormValues = { ...this.props.values };
      newFormValues[requirement.entityType] =
        newFormValues[requirement.entityType] || {};

      const params =
        newFormValues[requirement.entityType][
          requirement.entityToken || "__NEW__"
        ] || {};

      newFormValues[requirement.entityType][
        requirement.entityToken || "__NEW__"
      ] = params;
      RequirementsConverter.setValue(field, params, value).then(() => {
        this.props.onChange(newFormValues);
      });
    };

    params = (this.props.values[requirement.entityType] || {})[
      requirement.entityToken || "__NEW__"
    ];
    value = RequirementsConverter.getValue(field, params || {}) || "";

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
            placeholder="Select"
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
      case FieldType.ID_NUMBER:
        return (
          <InputText
            value={value}
            onChange={(event) => setValueFn(event.currentTarget.value)}
          />
        );
      case FieldType.ADDRESS:
        return <Address value={value} onChange={setValueFn} />;
      case FieldType.DATE:
        attributes = field.attributes as DateAttributes;
        switch (attributes.type) {
          case DateType.DATE_OF_BIRTH:
            return <DateOfBirth value={value} onChange={setValueFn} />;
          default:
            assertNever(attributes.type);
        }
        break;
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
