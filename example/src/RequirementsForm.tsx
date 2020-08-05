import React, { ReactFragment, ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  OnboardingSchema,
  EntityType,
  Requirement,
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

type Props = {
  schema: OnboardingSchema;
};
function RequirementsForm(props: Props) {
  return (
    <div>
      {entitySection(props.schema, EntityType.ACCOUNT)}
      {entitySection(props.schema, EntityType.UNKNOWN)}
    </div>
  );
}

function entitySection(
  schema: OnboardingSchema,
  entity: EntityType
): ReactFragment {
  switch (entity) {
    case EntityType.ACCOUNT:
    case EntityType.UNKNOWN:
      return (
        <React.Fragment>
          <h3>{entity}</h3>
          {formSection(EntityType.ACCOUNT, schema.fieldMap.get(entity))}
        </React.Fragment>
      );
    default:
      assertNever(entity);
  }
}

function formSection(
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
        {makeRequirementElement(r)}
      </label>
    </div>
  ));
  return <React.Fragment>{formElements}</React.Fragment>;
}

function makeRequirementElement(requirement: Requirement): ReactElement {
  let attributes;
  switch (requirement.field.fieldType) {
    case FieldType.TEXT:
      attributes = requirement.field.attributes as TextAttributes;
      let component;
      switch (attributes.type) {
        case TextType.SHORT:
          component = <InputText />;
          break;
        case TextType.LONG:
          component = <InputTextarea />;
          break;
        default:
          assertNever(attributes.type);
      }
      return component;
    case FieldType.ENUM:
      attributes = requirement.field.attributes as EnumAttributes;
      return (
        <Dropdown style={{ height: "30px" }} options={attributes.values} />
      );
    case FieldType.PHONE:
      return (
        <PhoneInput
          placeholder="Enter phone number"
          value=""
          onChange={() => {}}
        />
      );
    case FieldType.URL:
    case FieldType.EMAIL:
      return <InputText />;
    default:
      return <span>{requirement.requirementId}</span>;
  }
}

export default RequirementsForm;
