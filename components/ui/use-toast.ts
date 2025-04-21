// Adapted from https://ui.shadcn.com/docs/components/toast
import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: (options: any) => {
      return sonnerToast(options.title, {
        description: options.description,
        duration: options.duration || 3000,
      });
    },
  };
}

// Re-export the toast function from sonner
export const toast = sonnerToast; 