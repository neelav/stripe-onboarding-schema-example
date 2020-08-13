import React from "react";

type Value = {
  line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};
type Props = {
  value?: Value;
  onChange: (value: Value) => void;
};

const Address = (props: Props) => {
  return (
    <div>
      <input
        type="text"
        placeholder="line1"
        value={props?.value?.line1 || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, line1: event.target.value })
        }
      />
      <br />
      <input
        type="text"
        placeholder="city"
        value={props?.value?.city || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, city: event.target.value })
        }
      />
      <input
        type="text"
        placeholder="state"
        value={props?.value?.state || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, state: event.target.value })
        }
      />
      <input
        type="text"
        placeholder="zip"
        value={props?.value?.postal_code || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, postal_code: event.target.value })
        }
      />
    </div>
  );
};

export default Address;
