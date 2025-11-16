import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (location: string) => void;
  onUseMyLocation?: () => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, onUseMyLocation, placeholder = "Enter address or zip code" }: SearchBarProps) {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(location);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 pl-12 pr-4 text-base"
            data-testid="input-search-location"
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onUseMyLocation}
            className="h-14 px-6 gap-2"
            data-testid="button-use-location"
          >
            <MapPin className="h-5 w-5" />
            <span className="hidden md:inline">Use My Location</span>
          </Button>
          <Button type="submit" className="h-14 px-8" data-testid="button-search">
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
