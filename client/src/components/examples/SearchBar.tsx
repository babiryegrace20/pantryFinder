import { SearchBar } from "../SearchBar";

export default function SearchBarExample() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <SearchBar
        onSearch={(location) => console.log("Search:", location)}
        onUseMyLocation={() => console.log("Use my location clicked")}
      />
    </div>
  );
}
