import React, { ReactFragment, ReactElement } from "react";
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
      <label
        htmlFor={r.requirementId}
        style={{ width: "100px", overflowWrap: "anywhere" }}
      >
        <div className="p-col">{r.field.id}</div>
      </label>
      {makeRequirementElement(r)}
    </div>
  ));
  return <React.Fragment>{formElements}</React.Fragment>;
}

function makeRequirementElement(requirement: Requirement): ReactElement {
  switch (requirement.field.fieldType) {
    case FieldType.ENUM:
      const attributes = requirement.field.attributes as EnumAttributes;
      return (
        <Dropdown
          name={requirement.requirementId}
          style={{ height: "30px" }}
          options={attributes.values}
        />
      );
    default:
      return <span>{requirement.requirementId}</span>;
  }
}

export default RequirementsForm;
