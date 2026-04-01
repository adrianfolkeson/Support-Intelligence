"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all",
            "hover:scale-[1.02] active:scale-[0.98]",
            {
              "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg":
                action.variant === "primary" || !action.variant,
              "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50":
                action.variant === "outline",
              "bg-neutral-100 text-neutral-900 hover:bg-neutral-200":
                action.variant === "secondary",
            }
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* Pre-built empty states for common scenarios */

import { FileText, Upload, AlertCircle, Webhook, BarChart3, Search } from "lucide-react";

export function NoTickets({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No tickets yet"
      description="Upload your support tickets to get started with AI-powered churn prediction analysis."
      action={onUpload ? { label: "Upload Tickets", onClick: onUpload } : undefined}
    />
  );
}

export function NoReports({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No reports available"
      description="Generate detailed reports to analyze customer churn trends and patterns."
      action={onCreate ? { label: "Generate Report", onClick: onCreate } : undefined}
    />
  );
}

export function NoWebhooks({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Webhook}
      title="No webhooks configured"
      description="Set up webhooks to receive real-time notifications about high-risk customers and analysis results."
      action={onAdd ? { label: "Add Webhook", onClick: onAdd } : undefined}
    />
  );
}

export function NoHighRiskCustomers() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No high-risk customers"
      description="Great news! All your customers are currently in good standing. Keep up the excellent support."
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
    />
  );
}

export function NoIntegrations({ onConnect }: { onConnect?: () => void }) {
  return (
    <EmptyState
      icon={Webhook}
      title="No integrations connected"
      description="Connect your support tools to automatically sync tickets and streamline your workflow."
      action={onConnect ? { label: "Connect Integration", onClick: onConnect } : undefined}
    />
  );
}

export function NoData({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-neutral-300" />
      </div>
      <h3 className="text-lg font-medium text-neutral-600">{message}</h3>
    </div>
  );
}

export function EmptyCardState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-6 text-center bg-neutral-50 rounded-lg">
      <div className="w-12 h-12 mb-3 rounded-full bg-neutral-200 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-neutral-300" />
      </div>
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
