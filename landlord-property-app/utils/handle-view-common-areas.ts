export const handleViewCommonAreas = (
  buildingName: string,
  setSelectedBuilding: (building: string) => void,
  setViewMode: (mode: "list" | "building" | "commonAreas") => void,
) => {
  setSelectedBuilding(buildingName)
  setViewMode("commonAreas")
}
