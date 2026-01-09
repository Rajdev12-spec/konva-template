import type { CanvasNode, RectNode, TextNode } from "../../types/editor"


type Props = {
  nodes: CanvasNode[]
  selectedId: string | null
  updateNode: (
    id: string,
    attrs: Partial<TextNode> | Partial<RectNode>
  ) => void
}

export default function Properties({
  nodes,
  selectedId,
  updateNode
}: Props) {
  const node = nodes.find(n => n.id === selectedId)
  if (!node) return <div style={{ width: 250 }} />

  if (node.type === "text") {
    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Text Properties</h4>

        <input
          value={node.text}
          onChange={e =>
            updateNode(node.id, { text: e.target.value })
          }
        />

        <input
          type="number"
          value={node.fontSize}
          onChange={e =>
            updateNode(node.id, { fontSize: +e.target.value })
          }
        />
      </div>
    )
  }

  if (node.type === "rect") {
    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Rect Properties</h4>

        <input
          type="color"
          value={node.fill}
          onChange={e =>
            updateNode(node.id, { fill: e.target.value })
          }
        />
      </div>
    )
  }

  return null
}
