"use client";

import { CronFields, parseCronExpression, fieldsToExpression } from "@/lib/cron-utils";
import CronFieldColumn from "./CronFieldColumn";

interface VisualBuilderProps {
  expression: string;
  onChange: (expression: string) => void;
}

export default function VisualBuilder({ expression, onChange }: VisualBuilderProps) {
  const fields = parseCronExpression(expression);

  const handleFieldChange = (field: keyof CronFields, value: string) => {
    const updated = { ...fields, [field]: value };
    onChange(fieldsToExpression(updated));
  };

  const fieldKeys: (keyof CronFields)[] = [
    "minute",
    "hour",
    "dayOfMonth",
    "month",
    "dayOfWeek",
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
        Visual Builder
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {fieldKeys.map((field) => (
          <CronFieldColumn
            key={field}
            field={field}
            value={fields[field]}
            onChange={(val) => handleFieldChange(field, val)}
          />
        ))}
      </div>
    </div>
  );
}
