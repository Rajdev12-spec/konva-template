import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Group, Path, Rect, Text, Transformer } from "react-konva"
import type { CanvasNode, LinkNode } from "../../types/editor"

type Props = {
  node: LinkNode
  selected: boolean
  preview: boolean
  onSelect: () => void
  onUpdate: (id: string, attrs: Partial<LinkNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  setSelectedId: (id: string | null) => void
}

export default function EditableLink({
  node,
  selected,
  preview,
  onSelect,
  onUpdate,
  setNodes,
  setSelectedId
}: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 })
  const [posDown, setPosDown] = useState(false);
  const [origIndex, setOrigIndex] = useState<number | null>(null)


  const togglePosition = () => {
    if (!posDown) {
      setNodes((prev: any[]) => {
        const idx = prev.findIndex(n => n.id === node.id)
        if (idx <= 0) return prev
        const arr = [...prev]
          ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
        setPosDown(true)
        setOrigIndex(idx)
        return arr
      })
    } else {
      setNodes((prev: any[]) => {
        const currIdx = prev.findIndex(n => n.id === node.id)
        if (currIdx === -1 || origIndex === null) return prev
        const item = prev[currIdx]
        const rest = prev.filter((_, i) => i !== currIdx)
        const insertIndex = Math.min(Math.max(origIndex, 0), rest.length)
        const arr = [
          ...rest.slice(0, insertIndex),
          item,
          ...rest.slice(insertIndex)
        ]
        setPosDown(false)
        setOrigIndex(null)
        return arr
      })
    }
  }


  /* Attach transformer */
  useEffect(() => {
    if (selected && !preview && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, preview])

  /* Action bar position */
  useEffect(() => {
    if (!selected || !groupRef.current) return

    const { x, y, width } = groupRef.current.getClientRect()

    setActionPos({
      x: x + width / 2 - 120,
      y: y - 50
    })
  }, [selected, node.x, node.y, node.width, node.height])

  const duplicateNode = () => {
    const copy = { ...node, id: crypto.randomUUID(), x: node.x + 10, y: node.y + 10 }
    setNodes((prev: CanvasNode[]) => [...prev, copy])
    setSelectedId(copy.id)
  }

  const deleteNode = () => {
    setNodes(prev => prev.filter(n => n.id !== node.id))
    setSelectedId(null)
  }

  return (
    <>
      {/* LINK NODE */}
      <Group
        ref={groupRef}
        x={node.x}
        y={node.y}
        draggable={!preview}
        listening={true}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e =>
          onUpdate(node.id, { x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const g = groupRef.current
          if (!g) return

          const scaleX = g.scaleX()
          const scaleY = g.scaleY()
          const scale = Math.min(scaleX, scaleY)

          onUpdate(node.id, {
            width: Math.max(80, node.width * scaleX),
            height: Math.max(32, node.height * scaleY),
            fontSize: Math.max(10, node.fontSize * scale)
          })

          g.scaleX(1)
          g.scaleY(1)
        }}
        onMouseDown={e => {
          if (!preview) return
          e.cancelBubble = true
          node.href && window.open(node.href, "_blank")
        }}
      >
        <Rect
          width={node.width}
          height={node.height}
          fill={node.fill}
          cornerRadius={node.radius}
        />

        <Text
          width={node.width}
          height={node.height}
          text={node.text}
          fontSize={node.fontSize}
          fill={node.textColor}
          align="center"
          verticalAlign="middle"
        />
      </Group>

      {/* EDIT CONTROLS */}
      {!preview && selected && (
        <>
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right"
            ]}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 80 || newBox.height < 32 ? oldBox : newBox
            }
          />

          {/* ACTION BAR */}
          <Group x={actionPos.x} y={actionPos.y}>
            <Rect width={120} height={28} cornerRadius={6} fill="#f8f9fa" stroke="#d1d5db" />

            <Path
              data="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z"
              x={10}
              y={8}
              scaleX={0.9}
              scaleY={0.9}
              fill="#111827"
              onClick={duplicateNode}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />

            <Path
              data="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17"
              x={38}
              y={8}
              scaleX={0.9}
              scaleY={0.9}
              fill="#111827"
              onClick={deleteNode}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />

            <Text
              text={`Position ${posDown ? '↑' : '↓'}`}
              x={78}
              y={8}
              fontSize={12}
              onClick={togglePosition}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />
          </Group>
        </>
      )}
    </>
  )
}
