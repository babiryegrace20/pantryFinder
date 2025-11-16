import { useState } from "react";
import { FilterPanel } from "../FilterPanel";

export default function FilterPanelExample() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Canned Goods"]);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showSurplusOnly, setShowSurplusOnly] = useState(true);

  return (
    <div className="max-w-sm p-6">
      <FilterPanel
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        showOpenOnly={showOpenOnly}
        onOpenOnlyChange={setShowOpenOnly}
        showSurplusOnly={showSurplusOnly}
        onSurplusOnlyChange={setShowSurplusOnly}
        onReset={() => {
          setSelectedCategories([]);
          setShowOpenOnly(false);
          setShowSurplusOnly(false);
        }}
      />
    </div>
  );
}
