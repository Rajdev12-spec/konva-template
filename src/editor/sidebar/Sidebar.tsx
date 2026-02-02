type SidebarItem = {
  label: string
  type: string
  className?: string
}

const ITEMS: SidebarItem[] = [
  { label: "Header", type: "header" },
  { label: "Cards", type: "card" },
  { label: "Video", type: "video" },
  { label: "Link", type: "link" },
  { label: "Q&A", type: "qna" },
  { label: "Profile Card", type: "profileCard" },
  { label: "Text", type: "text" },
  // { label: "Rect", type: "rect" },
  { label: "Image", type: "image" },
  { label: "Carousel", type: "carousel" },

]

const baseClass =
  "rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50 active:cursor-grabbing"

export default function Sidebar() {
  const onDragStart =
    (type: string) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("nodeType", type)
      }

  return (
    <div className="h-full w-full p-3 flex flex-col gap-2 overflow-y-auto">
      {ITEMS.map(({ label, type }) => (
        <div
          key={type}
          draggable
          onDragStart={onDragStart(type)}
          className={baseClass}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
