// Adapted from https://ui.shadcn.com/docs/components/toast
import { useToast as useSonnerToast } from "@/components/ui/sonner";

export function useToast() {
  const { toast } = useSonnerToast();

  return {
    toast: (options: any) => {
      return toast(options.title, {
        description: options.description,
        variant: options.variant,
        duration: options.duration || 3000,
      });
    },
  };
}

export { toast } from "@/components/ui/sonner"; 