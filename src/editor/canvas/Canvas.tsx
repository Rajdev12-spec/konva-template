// Canvas.tsx
import { Layer, Stage } from "react-konva"
import EditableRect from "./EditableRect"
import type { CanvasNode, RectNode, TextNode } from "../../types/editor"
import EditableResizableText from "./EditableText"

type Props = {
  nodes: CanvasNode[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  updateNode: (id: string, attrs: Partial<TextNode> | Partial<RectNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  preview?: boolean
}

export default function Canvas({ nodes, selectedId, setSelectedId, updateNode, setNodes, preview }: Props) {

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("nodeType") as "text" | "rect"

    //getBoundingClientRect gives the position of the node
    const bounds = e.currentTarget.getBoundingClientRect()

    const x = e.clientX - bounds.left
    const y = e.clientY - bounds.top

    if (type === "text") {
      const newNode: TextNode = {
        id: crypto.randomUUID(),
        type: "text",
        x,
        y,
        text: "New Text",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "#000",
        rotation: 0
      }
      setNodes(prev => [...prev, newNode])
    } else if (type === "rect") {
      const newNode: RectNode = {
        id: crypto.randomUUID(),
        type: "rect",
        x,
        y,
        width: 150,
        height: 100,
        fill: "yellow",
        rotation: 0
      }
      setNodes(prev => [...prev, newNode])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  return (
    <div
      style={{ flex: 1 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage width={window.innerWidth - 400} height={window.innerHeight}>
        <Layer>
          {nodes.map(node => {
            if (node.type === "text") {
              return (
                <EditableResizableText
                  key={node.id}
                  node={node}
                  selected={!preview && node.id === selectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                  onUpdate={preview ? () => { } : updateNode}
                  preview={preview}
                />
              )
            }
            if (node.type === "rect") {
              return (
                <EditableRect
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                  onUpdate={updateNode}
                />
              )
            }
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}
