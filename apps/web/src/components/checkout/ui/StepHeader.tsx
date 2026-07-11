"use client";

import React from "react";

type StepHeaderProps = {
  number: string;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  onEdit?: () => void;
};

export const StepHeader: React.FC<StepHeaderProps> = ({
  number,
  title,
  subtitle,
  isCompleted,
  onEdit,
}) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-foreground text-background font-mono text-[11px] px-[7px] py-[3px] rounded-[2px] mt-2">
          {number}
        </div>
        <div>
          <h2 className="font-serif text-[26px] leading-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans text-[13px] text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {isCompleted && (
        <button
          onClick={onEdit}
          className="font-sans text-[13px] text-primary hover:underline mt-2"
        >
          Edit
        </button>
      )}
    </div>
  );
};
