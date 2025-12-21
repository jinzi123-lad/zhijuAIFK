import type { Property } from "@/types/property"

export const handleAddProperty = (property: Omit<Property, "id">) => {
  console.log("[v0] New property added:", property)
  // In a real app, this would make an API call to save the property
  // For now, just log it
}
