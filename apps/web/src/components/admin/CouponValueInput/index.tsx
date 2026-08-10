"use client";

import type { NumberFieldClientComponent } from "payload";

import {
  FieldDescription,
  FieldLabel,
  NumberField,
  useField,
  useFormFields,
} from "@payloadcms/ui";
import { useEffect, useState } from "react";

import { INR_CURRENCIES } from "@/currencies";

const currency = INR_CURRENCIES.supportedCurrencies[0]!;

const toDisplay = (value: number | null | undefined): string =>
  value == null
    ? ""
    : `${currency.symbol}${(value / 10 ** currency.decimals).toFixed(currency.decimals)}`;

const toBase = (display: string): number =>
  Math.round(
    parseFloat(display.replace(/[^0-9.]/g, "") || "0") *
      10 ** currency.decimals,
  );

export const CouponValueInput: NumberFieldClientComponent = (props) => {
  const { path, readOnly } = props;

  const discountType = useFormFields(([fields]) =>
    fields["discountType"],
  )?.value as "percentage" | "fixed" | undefined;

  const { setValue, value } = useField({ path });

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(toDisplay(typeof value === "number" ? value : undefined));
  }, [value]);

  if (discountType === "percentage") {
    return <NumberField {...props} />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!/^\d*(?:\.\d*)?$/.test(inputValue)) return;
    setDisplayValue(inputValue);
  };

  const handleBlur = () => {
    if (displayValue === "") {
      setValue(null);
      return;
    }
    const baseValue = toBase(displayValue);
    setValue(baseValue);
    setDisplayValue(toDisplay(baseValue));
  };

  return (
    <div className="field-type number">
      {props.field.label ? (
        <FieldLabel htmlFor={path} label={props.field.label} />
      ) : null}
      <div className="input">
        <input
          id={path}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0.00"
          readOnly={readOnly}
          type="text"
          value={displayValue}
        />
      </div>
      {props.field.admin?.description ? (
        <FieldDescription
          description={props.field.admin.description}
          path={path}
        />
      ) : null}
    </div>
  );
};
