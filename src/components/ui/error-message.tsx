import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: "default" | "destructive";
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Error",
  message,
  variant = "destructive",
  dismissible = false,
  onDismiss,
  className
}) => {
  return (
    <Alert variant={variant} className={cn("relative", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {title && <div className="font-medium mb-1">{title}</div>}
        <div>{message}</div>
      </AlertDescription>
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};