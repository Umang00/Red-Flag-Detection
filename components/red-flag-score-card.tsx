"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export type RedFlag = {
  category: string;
  evidence: string;
  explanation: string;
};

export type RedFlagAnalysis = {
  redFlagScore: number;
  verdict: string;
  criticalFlags?: RedFlag[];
  warnings?: RedFlag[];
  notices?: RedFlag[];
  positives?: RedFlag[];
  advice?: string;
};

type RedFlagScoreCardProps = {
  analysis: RedFlagAnalysis;
  className?: string;
};

type FlagSectionProps = {
  title: string;
  flags?: RedFlag[];
  icon: string;
  sectionKey: string;
  expandedSection: string | null;
  onToggle: (section: string) => void;
};

function FlagSection({
  title,
  flags,
  icon,
  sectionKey,
  expandedSection,
  onToggle,
}: FlagSectionProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  const isExpanded = expandedSection === sectionKey;

  return (
    <div className="border-t pt-4">
      <button
        className="flex w-full items-center justify-between text-left font-medium hover:opacity-70"
        onClick={() => onToggle(sectionKey)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
          <span className="text-muted-foreground text-sm">
            ({flags.length})
          </span>
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {flags.map((flag, index) => (
            <div
              className="rounded-lg border bg-muted/30 p-3"
              key={`${sectionKey}-${flag.category}-${index}`}
            >
              <div className="mb-1 font-semibold text-sm">{flag.category}</div>
              {flag.evidence && (
                <div className="mb-2 rounded border-muted-foreground border-l-2 bg-background p-2 text-sm italic">
                  "{flag.evidence}"
                </div>
              )}
              <div className="text-muted-foreground text-sm">
                {flag.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RedFlagScoreCard({
  analysis,
  className,
}: RedFlagScoreCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "critical"
  );

  const getScoreColor = (score: number) => {
    if (score >= 7) {
      return "text-red-500 bg-red-50 border-red-200";
    }
    if (score >= 4) {
      return "text-yellow-500 bg-yellow-50 border-yellow-200";
    }
    return "text-green-500 bg-green-50 border-green-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) {
      return "High Risk";
    }
    if (score >= 4) {
      return "Medium Risk";
    }
    return "Low Risk";
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Red Flag Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 p-6",
            getScoreColor(analysis.redFlagScore)
          )}
        >
          <div className="font-bold text-6xl">
            {analysis.redFlagScore.toFixed(1)}
          </div>
          <div className="font-medium text-sm">
            {getScoreLabel(analysis.redFlagScore)}
          </div>
          <div className="text-center font-medium text-sm">
            {analysis.verdict}
          </div>
        </div>

        {/* Flag Sections */}
        <div className="space-y-2">
          <FlagSection
            expandedSection={expandedSection}
            flags={analysis.criticalFlags}
            icon="🔴"
            onToggle={toggleSection}
            sectionKey="critical"
            title="Critical Flags"
          />
          <FlagSection
            expandedSection={expandedSection}
            flags={analysis.warnings}
            icon="🟡"
            onToggle={toggleSection}
            sectionKey="warnings"
            title="Warnings"
          />
          <FlagSection
            expandedSection={expandedSection}
            flags={analysis.notices}
            icon="🟢"
            onToggle={toggleSection}
            sectionKey="notices"
            title="Notices"
          />
          <FlagSection
            expandedSection={expandedSection}
            flags={analysis.positives}
            icon="✨"
            onToggle={toggleSection}
            sectionKey="positives"
            title="Positive Aspects"
          />
        </div>

        {/* Advice */}
        {analysis.advice && (
          <div className="border-t pt-4">
            <div className="mb-2 font-medium">💡 Advice</div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              {analysis.advice}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="border-t pt-4">
          <Button className="w-full" disabled variant="outline">
            Share Analysis (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
