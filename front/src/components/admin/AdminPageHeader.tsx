import React from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  resultCount?: number;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
  resultCount,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {resultCount !== undefined && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-medium text-white/70">
              {resultCount.toLocaleString()}건
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-white/60">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
