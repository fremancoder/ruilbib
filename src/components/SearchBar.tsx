import { useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Zoek op titel, auteur, genre..." }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white"
      />
      {value && (
        <button
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-900"
        >
          &times;
        </button>
      )}
    </div>
  );
}
