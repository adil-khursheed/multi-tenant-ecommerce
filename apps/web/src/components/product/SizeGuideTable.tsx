"use client";

import React, { useMemo, useState } from "react";

import type { SizeGuide } from "@/payload-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Props = {
  sizeGuide: SizeGuide;
};

const CM_TO_INCHES = 0.3937;

function convertValue(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;
  if (toUnit === "inches") return Math.round(value * CM_TO_INCHES * 10) / 10;
  return Math.round((value / CM_TO_INCHES) * 10) / 10;
}

export const SizeGuideTable: React.FC<Props> = ({ sizeGuide }) => {
  const [displayUnit, setDisplayUnit] = useState<"cm" | "inches">(
    sizeGuide.unit === "inches" ? "inches" : "cm",
  );

  const measurementKeys = useMemo(() => {
    if (!sizeGuide.rows?.length) return [];
    const firstRow = sizeGuide.rows[0];
    if (!firstRow?.measurements?.length) return [];
    return firstRow.measurements.map((m) => ({
      key: m.key,
      label: m.label,
    }));
  }, [sizeGuide.rows]);

  const hasEquivalents = useMemo(() => {
    if (!sizeGuide.rows?.length) return false;
    return sizeGuide.rows.some(
      (row) =>
        row.equivalentSizes?.us ||
        row.equivalentSizes?.uk ||
        row.equivalentSizes?.eu,
    );
  }, [sizeGuide.rows]);

  if (!sizeGuide.rows?.length || !measurementKeys.length) return null;

  const unitLabel = displayUnit === "cm" ? "cm" : "in";

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Measurements are in{" "}
          <span className="font-medium text-foreground">{unitLabel}</span>.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            setDisplayUnit((prev) => (prev === "cm" ? "inches" : "cm"))
          }
        >
          Switch to {displayUnit === "cm" ? "inches" : "cm"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            {measurementKeys.map((mk) => (
              <TableHead key={mk.key}>{mk.label}</TableHead>
            ))}
            {hasEquivalents && (
              <>
                <TableHead>US</TableHead>
                <TableHead>UK</TableHead>
                <TableHead>EU</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sizeGuide.rows.map((row, i) => (
            <TableRow key={row.id ?? i}>
              <TableCell className="font-medium">{row.sizeLabel}</TableCell>
              {measurementKeys.map((mk) => {
                const measurement = row.measurements?.find(
                  (m) => m.key === mk.key,
                );
                const rawValue = measurement?.value ?? 0;
                const displayValue = convertValue(
                  rawValue,
                  sizeGuide.unit || "cm",
                  displayUnit,
                );
                return (
                  <TableCell key={mk.key}>
                    {displayValue} {unitLabel}
                  </TableCell>
                );
              })}
              {hasEquivalents && (
                <>
                  <TableCell>{row.equivalentSizes?.us || "—"}</TableCell>
                  <TableCell>{row.equivalentSizes?.uk || "—"}</TableCell>
                  <TableCell>{row.equivalentSizes?.eu || "—"}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {sizeGuide.fitNote && (
        <p className="mt-3 text-xs text-muted-foreground italic">
          {sizeGuide.fitNote}
        </p>
      )}
    </div>
  );
};
