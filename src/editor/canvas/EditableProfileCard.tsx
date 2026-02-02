import {
  Group,
  Rect,
  Image as KonvaImage,
  Text,
  Transformer,
  Path
} from "react-konva"
import Konva from "konva"
import { useRef, useState, useEffect } from "react"
import type { CanvasNode, ProfileCardNode } from "../../types/editor"

type Props = {
  node: ProfileCardNode
  selected: boolean
  preview: boolean
  onSelect: () => void
  setSelectedId: (id: string | null) => void
  onUpdate: (id: string, attrs: Partial<ProfileCardNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  scale: number
}

const MIN_WIDTH = 150
const MIN_HEIGHT = 200

export default function EditableProfileCard({
  node,
  selected,
  preview,
  onSelect,
  onUpdate,
  setNodes,
  setSelectedId,
  scale
}: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [posDown, setPosDown] = useState(false)
  const [origIndex, setOrigIndex] = useState<number | null>(null)

  /* Load profile image */
  useEffect(() => {
    if (!node.profileImage) return
    const img = new Image()
    img.src = node.profileImage
    img.crossOrigin = "anonymous"
    img.onload = () => setImgElement(img)
  }, [node.profileImage])

  /* Attach transformer */
  useEffect(() => {
    if (selected && !preview && trRef.current && groupRef.current) {
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
      {/* ================= PROFILE CARD ================= */}
      <Group
        ref={groupRef}
        x={node.x}
        y={node.y}
        draggable={!preview}
        listening={!preview}
        onClick={!preview ? onSelect : undefined}
        onTap={!preview ? onSelect : undefined}
        onDragEnd={e =>
          onUpdate(node.id, {
            x: e.target.x(),
            y: e.target.y()
          })
        }
        onTransformEnd={() => {
          const g = groupRef.current
          if (!g) return

          const newWidth = Math.max(
            MIN_WIDTH,
            node.width * g.scaleX()
          )
          const newHeight = Math.max(
            MIN_HEIGHT,
            node.height * g.scaleY()
          )

          g.scaleX(1)
          g.scaleY(1)

          onUpdate(node.id, {
            width: newWidth,
            height: newHeight
          })
        }}
      >
        {/* Card background */}
        <Rect
          width={node.width}
          height={node.height}
          fill="#ffffff"
          cornerRadius={12}
          shadowBlur={8}
          shadowColor="#000"
        />

        {/* Profile image */}
        {imgElement && (
          <KonvaImage
            image={imgElement}
            x={node.width / 2 - node.width / 4}
            y={12}
            width={node.width / 2}
            height={node.width / 2}
            cornerRadius={node.width / 4}
            onClick={() => !preview && fileInputRef.current?.click()}
            onTap={() => !preview && fileInputRef.current?.click()}
          />
        )}

        {/* Name */}
        <Text
          x={10}
          y={node.width / 2 + 20}
          width={node.width - 20}
          text={node.name || "Name"}
          fontSize={node.nameFontSize ?? 16}
          fontStyle="bold"
          align="center"
          fill="#111827"
        />

        {/* Role */}
        <Text
          x={10}
          y={node.width / 2 + 48}
          width={node.width - 20}
          text={node.role || "Role / Description"}
          fontSize={node.roleFontSize ?? 12}
          align="center"
          fill="#4b5563"
        />
      </Group>

      {/* Action toolbar */}
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

          {/* Duplicate */}
          <Path
            data="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z"
            x={12}
            y={9}
            scaleX={0.85}
            scaleY={0.85}
            fill="#111827"
            onClick={duplicateNode}
            onTap={duplicateNode}
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'pointer' }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default' }}
          />

          {/* Delete */}
          <Path
            data="M7 21q-.825 0-1.412-.587T5 19V6h14v13q0 .825-.587 1.413T17 21z"
            x={40}
            y={9}
            scaleX={0.85}
            scaleY={0.85}
            fill="#111827"
            onClick={deleteNode}
            onTap={deleteNode}
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'pointer' }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default' }}
          />

          {/* Position */}
          <Text
            text={`Position ${posDown ? "↑" : "↓"}`}
            x={72}
            y={12}
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

      {/* ================= TRANSFORMER ================= */}
      {!preview && selected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (
              newBox.width < MIN_WIDTH ||
              newBox.height < MIN_HEIGHT
            ) {
              return oldBox
            }
            return newBox
          }}
        />
      )}

      {/* ================= IMAGE INPUT ================= */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const url = URL.createObjectURL(file)
          onUpdate(node.id, { profileImage: url })
        }}
      />
    </>
  )
}
