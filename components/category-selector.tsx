"use client";

import { type RedFlagCategory, categoryInfo } from "@/lib/ai/red-flag-prompts";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface CategorySelectorProps {
  selectedCategory?: RedFlagCategory;
  onCategoryChange: (category: RedFlagCategory | undefined) => void;
  className?: string;
}

export function CategorySelector({
  selectedCategory,
  onCategoryChange,
  className,
}: CategorySelectorProps) {
  const categories: RedFlagCategory[] = [
    "dating",
    "conversations",
    "jobs",
    "housing",
    "marketplace",
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        What should I analyze?
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const info = categoryInfo[category];
          const isSelected = selectedCategory === category;

          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "outline"}
              onClick={() =>
                onCategoryChange(isSelected ? undefined : category)
              }
              className={cn(
                "h-auto flex-col gap-1 px-3 py-4 transition-all",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {info.emoji}
              </span>
              <span className="text-sm font-semibold">{info.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {info.description}
              </span>
            </Button>
          );
        })}
      </div>
      {selectedCategory && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">Selected:</span> {categoryInfo[selectedCategory].emoji}{" "}
          {categoryInfo[selectedCategory].name}
          <button
            type="button"
            onClick={() => onCategoryChange(undefined)}
            className="ml-2 text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
