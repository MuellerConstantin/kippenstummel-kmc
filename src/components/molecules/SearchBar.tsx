"use client";

import { useEffect, useState } from "react";
import { SearchField } from "@/components/atoms/SearchField";
import { Select, SelectItem } from "@/components/atoms/Select";

interface SearchBarProps {
  onSearch: (property: string, searchTerm: string) => void;
  properties: {
    label: string;
    value: string;
  }[];
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function SearchBar(props: SearchBarProps) {
  const { onSearch } = props;

  const [selectedProperty, setSelectedProperty] = useState<string>(
    props.properties[0]?.value,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch && selectedProperty) {
        onSearch(selectedProperty, searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedProperty, searchTerm, onSearch]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select
        isDisabled={props.isDisabled}
        items={props.properties}
        selectedKey={selectedProperty}
        onSelectionChange={(property) =>
          setSelectedProperty(property as string)
        }
      >
        {props.properties.map((property) => (
          <SelectItem
            id={property.value}
            key={property.value}
            textValue={property.value}
          >
            {property.label}
          </SelectItem>
        ))}
      </Select>
      <SearchField
        className="grow"
        isDisabled={props.isDisabled}
        isReadOnly={props.isReadOnly}
        value={searchTerm}
        onChange={(value) => setSearchTerm(value)}
        onClear={() => {
          setSearchTerm("");
          props.onSearch(selectedProperty, "");
        }}
      />
    </div>
  );
}
