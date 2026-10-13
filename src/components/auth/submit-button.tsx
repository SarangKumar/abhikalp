"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
}

const SubmitButton = ({
  children,
  loading,
  disabled,
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  const busy = loading || pending;

  return (
    <Button
      {...props}
      type="submit"
      disabled={busy || disabled}
      aria-busy={busy}
    >
      {busy ? <Spinner /> : children}
    </Button>
  );
};

export default SubmitButton;
