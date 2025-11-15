"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void> | void;
  title?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  initialValue?: string;
}

export function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  title = "Create New Project",
  description = "Give your project a name to get started",
  placeholder = "Enter project name...",
  submitLabel = "Create",
  cancelLabel = "Cancel",
  icon,
  isLoading = false,
  initialValue = "",
}: CreateProjectModalProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input value when modal opens/closes or initialValue changes
  useEffect(() => {
    if (open) {
      setInputValue(initialValue);
    }
  }, [open, initialValue]);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    await onSubmit(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md fade-in zoom-in">
        <div
          className={cn(
            "relative rounded-2xl border border-white/10",
            "bg-gradient-to-br from-black/80 via-black/60 to-black/80",
            "backdrop-blur-xl shadow-2xl",
            "p-8 space-y-6"
          )}
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            {icon ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                {icon}
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className={cn(
                  "w-full h-12 text-base",
                  "bg-white/5 border-white/10",
                  "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                  "backdrop-blur-sm",
                  "placeholder:text-muted-foreground/50"
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

