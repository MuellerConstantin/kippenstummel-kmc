import React from "react";
import {
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Description, FieldError, Label, fieldBorderStyles } from "./Field";
import { composeTailwindRenderProps, focusRing } from "@/components/utils";

const inputStyles = tv({
  extend: focusRing,
  base: "border-2 rounded-md p-2",
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    isInvalid: fieldBorderStyles.variants.isInvalid,
    isDisabled: fieldBorderStyles.variants.isDisabled,
  },
});

export interface TextAreaProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "flex flex-col gap-1",
      )}
    >
      {label && <Label>{label}</Label>}
      <AriaTextArea
        className={inputStyles}
        placeholder={placeholder}
        maxLength={props.maxLength}
        minLength={props.minLength}
        rows={props.rows}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
