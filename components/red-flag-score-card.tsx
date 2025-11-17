"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface RedFlag {
  category: string;
  evidence: string;
  explanation: string;
}

export interface RedFlagAnalysis {
  redFlagScore: number;
  verdict: string;
  criticalFlags?: RedFlag[];
  warnings?: RedFlag[];
  notices?: RedFlag[];
  positives?: RedFlag[];
  advice?: string;
}

interface RedFlagScoreCardProps {
  analysis: RedFlagAnalysis;
  className?: string;
}

export function RedFlagScoreCard({
  analysis,
  className,
}: RedFlagScoreCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("critical");

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-red-500 bg-red-50 border-red-200";
    if (score >= 4) return "text-yellow-500 bg-yellow-50 border-yellow-200";
    return "text-green-500 bg-green-50 border-green-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "High Risk";
    if (score >= 4) return "Medium Risk";
    return "Low Risk";
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const FlagSection = ({
    title,
    flags,
    icon,
    sectionKey,
  }: {
    title: string;
    flags?: RedFlag[];
    icon: string;
    sectionKey: string;
  }) => {
    if (!flags || flags.length === 0) return null;

    const isExpanded = expandedSection === sectionKey;

    return (
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between text-left font-medium hover:opacity-70"
        >
          <span className="flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
            <span className="text-sm text-muted-foreground">
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
                key={`${sectionKey}-${index}`}
                className="rounded-lg border bg-muted/30 p-3"
              >
                <div className="mb-1 font-semibold text-sm">{flag.category}</div>
                {flag.evidence && (
                  <div className="mb-2 rounded bg-background p-2 text-sm italic border-l-2 border-muted-foreground">
                    "{flag.evidence}"
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {flag.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
          <div className="text-6xl font-bold">{analysis.redFlagScore.toFixed(1)}</div>
          <div className="text-sm font-medium">{getScoreLabel(analysis.redFlagScore)}</div>
          <div className="text-center text-sm font-medium">
            {analysis.verdict}
          </div>
        </div>

        {/* Flag Sections */}
        <div className="space-y-2">
          <FlagSection
            title="Critical Flags"
            flags={analysis.criticalFlags}
            icon="🔴"
            sectionKey="critical"
          />
          <FlagSection
            title="Warnings"
            flags={analysis.warnings}
            icon="🟡"
            sectionKey="warnings"
          />
          <FlagSection
            title="Notices"
            flags={analysis.notices}
            icon="🟢"
            sectionKey="notices"
          />
          <FlagSection
            title="Positive Aspects"
            flags={analysis.positives}
            icon="✨"
            sectionKey="positives"
          />
        </div>

        {/* Advice */}
        {analysis.advice && (
          <div className="border-t pt-4">
            <div className="mb-2 font-medium">💡 Advice</div>
            <div className="rounded-lg bg-blue-50 p-3 text-sm border border-blue-200">
              {analysis.advice}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="border-t pt-4">
          <Button variant="outline" className="w-full" disabled>
            Share Analysis (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
