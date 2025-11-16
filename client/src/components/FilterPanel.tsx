import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FilterPanelProps {
  categories?: string[];
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  showOpenOnly?: boolean;
  onOpenOnlyChange?: (value: boolean) => void;
  showSurplusOnly?: boolean;
  onSurplusOnlyChange?: (value: boolean) => void;
  onReset?: () => void;
}

const DEFAULT_CATEGORIES = [
  "Canned Goods",
  "Fresh Produce",
  "Dairy",
  "Bread & Bakery",
  "Meat & Protein",
  "Baby Formula",
  "Frozen Items",
  "Non-Food Items",
];

export function FilterPanel({
  categories = DEFAULT_CATEGORIES,
  selectedCategories = [],
  onCategoryChange,
  showOpenOnly = false,
  onOpenOnlyChange,
  showSurplusOnly = false,
  onSurplusOnlyChange,
  onReset,
}: FilterPanelProps) {
  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoryChange?.(updated);
  };

  const hasActiveFilters = selectedCategories.length > 0 || showOpenOnly || showSurplusOnly;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            data-testid="button-reset-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Availability</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="open-only"
                checked={showOpenOnly}
                onCheckedChange={(checked) => onOpenOnlyChange?.(checked as boolean)}
                data-testid="checkbox-open-only"
              />
              <Label
                htmlFor="open-only"
                className="text-sm font-normal cursor-pointer"
              >
                Open now
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="surplus-only"
                checked={showSurplusOnly}
                onCheckedChange={(checked) => onSurplusOnlyChange?.(checked as boolean)}
                data-testid="checkbox-surplus-only"
              />
              <Label
                htmlFor="surplus-only"
                className="text-sm font-normal cursor-pointer"
              >
                Surplus items available
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Food Categories</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  data-testid={`checkbox-category-${category}`}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
