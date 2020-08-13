import React from "react";

type Value = {
  month?: number;
  day?: number;
  year?: number;
};
type Props = {
  value?: Value;
  onChange: (value: Value) => void;
};

const DateOfBirth = (props: Props) => {
  return (
    <div>
      <input
        type="number"
        placeholder="month"
        value={props?.value?.month || ""}
        onChange={(event) =>
          props.onChange({
            ...props.value,
            month: parseInt(event.target.value),
          })
        }
      />
      <input
        type="number"
        placeholder="day"
        value={props?.value?.day || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, day: parseInt(event.target.value) })
        }
      />
      <input
        type="number"
        placeholder="year"
        value={props?.value?.year || ""}
        onChange={(event) =>
          props.onChange({ ...props.value, year: parseInt(event.target.value) })
        }
      />
    </div>
  );
};

export default DateOfBirth;
