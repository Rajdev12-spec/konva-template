export default function Sidebar() {
  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    type: string
  ) => {
    e.dataTransfer.setData("nodeType", type)
  }

  return (
    <div className="h-full w-full p-3 flex flex-col gap-2 overflow-y-auto">
      <div
        draggable
        onDragStart={e => onDragStart(e, "text")}
        className="rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50 active:cursor-grabbing"
      >
        Text
      </div>
      <div
        draggable
        onDragStart={e => onDragStart(e, "link")}
        className="rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50"
      >
        Link
      </div>

      <div
        draggable
        onDragStart={e => onDragStart(e, "rect")}
        className="rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50 active:cursor-grabbing"
      >
        Rect
      </div>

      <div
        draggable
        onDragStart={e => onDragStart(e, "image")}
        className="rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50 active:cursor-grabbing"
      >
        Image
      </div>

      <div
        draggable
        onDragStart={e => onDragStart(e, "video")}
        className="rounded-md border border-gray-300 cursor-grab p-2 text-sm bg-white hover:bg-gray-50 active:cursor-grabbing"
      >
        Video
      </div>

      <div
        draggable
        onDragStart={e => onDragStart(e, "card")}
        className="border border-[#ccc] cursor-grab p-2"
      >
        Card
      </div>
      <div
        draggable
        onDragStart={e => onDragStart(e, "profileCard")}
        className="border border-[#ccc] cursor-grab p-2"
      >
        Profile Card
      </div>
      <div
        draggable
        onDragStart={e => onDragStart(e, "carousel")}
        className="border border-[#ccc] cursor-grab p-2"
      >
        Carousel
      </div>
      <div
        draggable
        onDragStart={e => e.dataTransfer.setData("nodeType", "qna")}
        className="border border-[#ccc] p-2 cursor-grab"
      >
        Q&A
      </div>

      <div
        draggable
        onDragStart={e => e.dataTransfer.setData("nodeType", "header")}
        className="border border-[#ccc] p-2 cursor-grab"
      >
        Header
      </div>

    </div>
  )
}
