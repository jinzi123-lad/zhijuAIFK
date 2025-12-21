"use client"

type PropertyStatus = "all" | "rented" | "vacant"

interface FilterTabsProps {
  currentFilter: PropertyStatus
  onFilterChange: (filter: PropertyStatus) => void
}

export function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  const tabs = [
    { label: "全部", value: "all" as PropertyStatus },
    { label: "已租", value: "rented" as PropertyStatus },
    { label: "空置", value: "vacant" as PropertyStatus },
  ]

  return (
    <div className="glass-card rounded-full p-1.5 flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`
            flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${
              currentFilter === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
