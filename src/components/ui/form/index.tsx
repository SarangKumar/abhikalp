"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "../label";

type FormFieldContextValue = {
  id: string;
  name?: string;
  descriptionId: string;
  messageId: string;
  error?: string;
  invalid: boolean;
  disabled: boolean;
  descriptionMounted: boolean;
  messageMounted: boolean;
  setDescriptionMounted: (mounted: boolean) => void;
  setMessageMounted: (mounted: boolean) => void;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function useFormField() {
  const context = React.useContext(FormFieldContext);

  if (!context) {
    throw new Error("Form field parts must render inside FormField.");
  }

  return context;
}

export type FormProps = React.ComponentProps<"form">;

/**
 * Semantic form shell with consistent vertical rhythm between fields.
 */
export function Form({ className, ...props }: FormProps) {
  return (
    <form
      data-slot="form"
      className={cn("flex w-full min-w-0 flex-col gap-5", className)}
      {...props}
    />
  );
}

export type FormFieldProps = {
  children: React.ReactNode;
  /** Optional name for the field — useful as a stable id seed. */
  name?: string;
  /** Validation message. When set, the field is treated as invalid. */
  error?: string;
  /** Force invalid styling without a message. */
  invalid?: boolean;
  /** Propagate disabled semantics to label and control associations. */
  disabled?: boolean;
};

/**
 * Owns field ids and invalid/disabled state for nested Form parts.
 */
export function FormField({
  children,
  name,
  error,
  invalid,
  disabled = false,
}: FormFieldProps) {
  const reactId = React.useId();
  const id = name ? `form-${name}-${reactId}` : `form-field-${reactId}`;
  const isInvalid = invalid ?? Boolean(error);
  const [descriptionMounted, setDescriptionMounted] = React.useState(false);
  const [messageMounted, setMessageMounted] = React.useState(false);

  const value = React.useMemo<FormFieldContextValue>(
    () => ({
      id,
      name,
      descriptionId: `${id}-description`,
      messageId: `${id}-message`,
      error,
      invalid: isInvalid,
      disabled,
      descriptionMounted,
      messageMounted,
      setDescriptionMounted,
      setMessageMounted,
    }),
    [descriptionMounted, disabled, error, id, isInvalid, messageMounted, name],
  );

  return (
    <FormFieldContext.Provider value={value}>
      {children}
    </FormFieldContext.Provider>
  );
}

export type FormItemProps = React.ComponentProps<"div">;

/**
 * Vertical stack for label, control, description, and message.
 */
export function FormItem({ className, ...props }: FormItemProps) {
  const field = React.useContext(FormFieldContext);

  return (
    <div
      data-slot="form-item"
      data-invalid={field?.invalid ? "" : undefined}
      data-disabled={field?.disabled ? "" : undefined}
      className={cn("grid w-full min-w-0 gap-1.5", className)}
      {...props}
    />
  );
}

export type FormLabelProps = React.ComponentProps<typeof Label>;

export function FormLabel({ className, ...props }: FormLabelProps) {
  const field = useFormField();

  return (
    <Label
      data-slot="form-label"
      htmlFor={field.id}
      data-invalid={field.invalid ? "" : undefined}
      data-disabled={field.disabled ? "" : undefined}
      className={cn(
        field.invalid && "text-destructive",
        field.disabled && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type ControlElementProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "data-invalid"?: string;
};

/**
 * Merges accessible field props onto a single control child.
 */
export function FormControl({
  children,
}: {
  children: React.ReactElement<ControlElementProps>;
}) {
  const field = useFormField();

  if (!React.isValidElement<ControlElementProps>(children)) {
    throw new Error("FormControl expects a single React element child.");
  }

  const describedBy = [
    children.props["aria-describedby"],
    field.messageMounted ? field.messageId : undefined,
    field.descriptionMounted ? field.descriptionId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return React.cloneElement(children, {
    id: children.props.id ?? field.id,
    disabled: children.props.disabled ?? field.disabled,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": field.invalid ? true : children.props["aria-invalid"],
    "data-invalid": field.invalid ? "" : children.props["data-invalid"],
  });
}

export type FormDescriptionProps = React.ComponentProps<"p">;

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { descriptionId, disabled, setDescriptionMounted } = useFormField();

  React.useLayoutEffect(() => {
    setDescriptionMounted(true);
    return () => setDescriptionMounted(false);
  }, [setDescriptionMounted]);

  return (
    <p
      data-slot="form-description"
      id={descriptionId}
      className={cn(
        "text-muted-foreground text-sm leading-5 text-pretty",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export type FormMessageProps = React.ComponentProps<"p">;

/**
 * Renders the field error from context, or explicit children when provided.
 */
export function FormMessage({
  className,
  children,
  ...props
}: FormMessageProps) {
  const { error, messageId, setMessageMounted } = useFormField();
  const body = children ?? error;

  React.useLayoutEffect(() => {
    const mounted = Boolean(body);
    setMessageMounted(mounted);
    return () => setMessageMounted(false);
  }, [body, setMessageMounted]);

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={messageId}
      role="alert"
      className={cn(
        "text-destructive text-sm leading-5 font-medium",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}

export { useFormField };
