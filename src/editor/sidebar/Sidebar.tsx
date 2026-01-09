
export default function Sidebar() {
  
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, type: "text" | "rect") => {
    e.dataTransfer.setData("nodeType", type)
  }

  return (
    <div style={{ width: 200, padding: 10 }}>
      <div
        draggable
        onDragStart={e => onDragStart(e, "text")}
        style={{ padding: 8, border: "1px solid #ccc", marginBottom: 5, cursor: "grab" }}
      >
        Text
      </div>
      <div
        draggable
        onDragStart={e => onDragStart(e, "rect")}
        style={{ padding: 8, border: "1px solid #ccc", cursor: "grab" }}
      >
        Rect
      </div>
    </div>
  )
}
