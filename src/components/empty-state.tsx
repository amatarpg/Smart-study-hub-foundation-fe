import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
