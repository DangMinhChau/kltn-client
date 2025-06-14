import * as React from "react";
import { toast } from "sonner";

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
}

export function useToast() {
  return {
    toast: (props: Omit<Toast, "id">) => {
      if (props.variant === "destructive") {
        return toast.error(props.title as string, {
          description: props.description as string,
        });
      }
      return toast.success(props.title as string, {
        description: props.description as string,
      });
    },
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}
