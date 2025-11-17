"use client";

import { categoryInfo, type RedFlagCategory } from "@/lib/ai/red-flag-prompts";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type CategorySelectorProps = {
  selectedCategory?: RedFlagCategory;
  onCategoryChange: (category: RedFlagCategory | undefined) => void;
  className?: string;
};

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
      <div className="mb-2 font-medium text-muted-foreground text-sm">
        What should I analyze?
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const info = categoryInfo[category];
          const isSelected = selectedCategory === category;

          return (
            <Button
              className={cn(
                "h-auto flex-col gap-1 px-3 py-4 transition-all",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
              key={category}
              onClick={() =>
                onCategoryChange(isSelected ? undefined : category)
              }
              variant={isSelected ? "default" : "outline"}
            >
              <span aria-hidden="true" className="text-2xl">
                {info.emoji}
              </span>
              <span className="font-semibold text-sm">{info.name}</span>
              <span className="line-clamp-2 text-muted-foreground text-xs">
                {info.description}
              </span>
            </Button>
          );
        })}
      </div>
      {selectedCategory && (
        <div className="mt-2 text-muted-foreground text-sm">
          <span className="font-medium">Selected:</span>{" "}
          {categoryInfo[selectedCategory].emoji}{" "}
          {categoryInfo[selectedCategory].name}
          <button
            className="ml-2 text-primary hover:underline"
            onClick={() => onCategoryChange(undefined)}
            type="button"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
