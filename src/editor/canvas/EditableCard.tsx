import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Group, Rect, Image as KonvaImage, Text, Transformer, Path } from "react-konva"
import type { CardNode, CanvasNode } from "../../types/editor"

type Props = {
  node: CardNode
  selected: boolean
  preview: boolean
  onSelect: () => void
  setSelectedId: (id: string | null) => void
  onUpdate: (id: string, attrs: Partial<CardNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  scale: number
}

const MIN_WIDTH = 160
const MIN_HEIGHT = 180

export default function EditableCard({
  node,
  selected,
  preview,
  onSelect,
  setNodes,
  onUpdate,
  setSelectedId,
  scale
}: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const trRef = useRef<Konva.Transformer>(null)

  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null)
  const [posDown, setPosDown] = useState(false)
  const [origIndex, setOrigIndex] = useState<number | null>(null)
  /* Load image */
  useEffect(() => {
    if (!node.image) return
    const img = new Image()
    img.src = node.image
    img.crossOrigin = "anonymous"
    img.onload = () => setImgElement(img)
  }, [node.image])

  /* Attach transformer */
  useEffect(() => {
    if (selected && trRef.current && groupRef.current && !preview) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, preview])

  /* Duplicate */
  const duplicateNode = (e: any) => {
    if (e) e.cancelBubble = true
    const copy = {
      ...node,
      id: crypto.randomUUID(),
      x: node.x + 20,
      y: node.y + 20
    }
    setNodes(prev => [...prev, copy])
    setSelectedId(copy.id)
  }

  /* Delete */
  const deleteNode = (e: any) => {
    if (e) e.cancelBubble = true
    setNodes(prev => prev.filter(n => n.id !== node.id))
    setSelectedId(null)
  }

  /* Position toggle */
  const togglePosition = (e: any) => {
    if (e) e.cancelBubble = true
    if (!posDown) {
      setNodes(prev => {
        const idx = prev.findIndex(n => n.id === node.id)
        if (idx <= 0) return prev
        const arr = [...prev]
          ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
        setPosDown(true)
        setOrigIndex(idx)
        return arr
      })
    } else {
      setNodes(prev => {
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

  return (
    <>
      <Group
        ref={groupRef}
        x={node.x}
        y={node.y}
        draggable={!preview}
        listening={!preview}
        onClick={preview ? undefined : onSelect}
        onDragEnd={e =>
          onUpdate(node.id, {
            x: e.target.x(),
            y: e.target.y()
          })
        }
        onTransformEnd={() => {
          const g = groupRef.current
          if (!g) return

          onUpdate(node.id, {
            width: Math.max(MIN_WIDTH, node.width * g.scaleX()),
            height: Math.max(MIN_HEIGHT, node.height * g.scaleY())
          })

          g.scaleX(1)
          g.scaleY(1)
        }}
      >
        {/* Card shadow */}
        <Rect
          width={node.width}
          height={node.height}
          cornerRadius={12}
          fill="#000"
          opacity={0.06}
          shadowBlur={12}
          shadowOffset={{ x: 0, y: 6 }}
        />

        {/* Card body */}
        <Rect
          width={node.width}
          height={node.height}
          cornerRadius={12}
          fill="#ffffff"
          stroke="#e5e7eb"
        />

        {/* Image */}
        {imgElement && (
          <KonvaImage
            image={imgElement}
            width={node.width}
            height={node.height * 0.45}
            cornerRadius={[12, 12, 0, 0]}
          />
        )}

        {/* Title */}
        <Text
          x={12}
          y={node.height * 0.45 + 12}
          width={node.width - 24}
          text={node.title}
          fontSize={node.titleFontSize ?? 16}
          fontStyle="bold"
          fill="#111827"
        />

        {/* Description */}
        <Text
          x={12}
          y={node.height * 0.45 + 40}
          width={node.width - 24}
          text={node.description}
          fontSize={node.descriptionFontSize ?? 12}
          fill="#4b5563"
        />
      </Group>

      {/* Transformer */}
      {!preview && selected && <Transformer ref={trRef} />}

      {/* Action bar */}
      {!preview && selected && (
        <Group
          x={node.x + (node.width / 2) - (150 / 2 / scale)}
          y={node.y - (50 / scale)}
          scaleX={1 / scale}
          scaleY={1 / scale}
          listening
        >
          <Rect
            width={150}
            height={40}
            cornerRadius={6}
            fill="#ffffff"
            stroke="#d1d5db"
            shadowColor="#000"
            shadowBlur={6}
            shadowOpacity={0.06}
          />

          {/* Duplicate Icon */}
          <Path
            data="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z"
            x={12}
            y={8}
            scaleX={1}
            scaleY={1}
            fill="#111827"
            onClick={duplicateNode}
            onTap={duplicateNode}
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'pointer' }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default' }}
          />

          {/* Delete Icon */}
          <Path
            data="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17"
            x={42}
            y={8}
            scaleX={1}
            scaleY={1}
            fill="#111827"
            onClick={deleteNode}
            onTap={deleteNode}
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'pointer' }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default' }}
          />

          {/* Position Text */}
          <Text
            text={`Position ${posDown ? "↑" : "↓"}`}
            x={75}
            y={14}
            fontSize={12}
            fontStyle="bold"
            fill="#111827"
            onClick={togglePosition}
            onTap={togglePosition}
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'pointer' }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default' }}
          />
        </Group>
      )}
    </>
  )
}
