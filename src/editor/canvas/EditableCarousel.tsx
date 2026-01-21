import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Group, Image as KonvaImage, Path, Rect, Text, Transformer } from "react-konva"
import type { CanvasNode, CarouselNode } from "../../types/editor"

type Props = {
  preview: boolean
  selected: boolean
  node: CarouselNode
  onSelect: () => void
  openFilePicker: () => void
  setSelectedId: (id: string | null) => void
  onUpdate: (id: string, attrs: Partial<CarouselNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
}

export default function EditableCarousel({
  node,
  selected,
  preview,
  onSelect,
  onUpdate,
  setNodes,
  setSelectedId,
  openFilePicker
}: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [imgElements, setImgElements] = useState<(HTMLImageElement | null)[]>([])
  const [posDown, setPosDown] = useState(false)
  const [origIndex, setOrigIndex] = useState<number | null>(null)
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 })

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const promises = node.images.map(imageUrl => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          if (!imageUrl) {
            resolve(null)
            return
          }
          const img = new Image()
          img.src = imageUrl
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
        })
      })
      const results = await Promise.all(promises)
      setImgElements(results)
    }

    if (node.images.length > 0) {
      loadImages()
    } else {
      setImgElements([])
    }
  }, [node.images])

  // Transformer
  useEffect(() => {
    if (selected && !preview && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, preview])

  useEffect(() => {
    if (!node.autoplay || node.images.length < 3) return

    const timer = setInterval(() => {
      setNodes(prev =>
        prev.map(n => {
          if (n.type !== "carousel") return n
          if (n.id !== node.id) return n

          return {
            ...n,
            activeIndex: (n.activeIndex + 1) % n.images.length
          }
        })
      )
    }, node.interval || 3000)

    return () => clearInterval(timer)
  }, [
    node.autoplay,
    node.interval,
    node.images.length,
    node.id,
    setNodes
  ])


  /* Action bar position (EXACT same logic as Video) */
  useEffect(() => {
    if (!selected || !groupRef.current) return
    const box = groupRef.current.getClientRect()
    const barWidth = 150
    const barHeight = 40
    const x = box.x + box.width / 2 - barWidth / 2
    const y = box.y - barHeight - 8
    setActionPos({ x, y })
  }, [selected, node.x, node.y, node.width, node.height])

  /* Duplicate */
  const duplicateNode = () => {
    const copy = {
      ...node,
      id: crypto.randomUUID(),
      x: node.x + 10,
      y: node.y + 10
    }
    setNodes(prev => [...prev, copy])
    setSelectedId(copy.id)
  }

  /* Delete */
  const deleteNode = () => {
    setNodes(prev => prev.filter(n => n.id !== node.id))
    setSelectedId(null)
  }

  /* Position toggle */
  const togglePosition = () => {
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
        onClick={() => !preview && onSelect()}
        onDragEnd={e =>
          onUpdate(node.id, { x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const g = groupRef.current
          if (!g) return

          const scaleX = g.scaleX()
          const scaleY = g.scaleY()

          const newWidth = Math.max(50, node.width * scaleX)
          const newHeight = Math.max(50, node.height * scaleY)

          onUpdate(node.id, {
            width: newWidth,
            height: newHeight
          })

          // 🔑 reset scale or it breaks future transforms
          g.scaleX(1)
          g.scaleY(1)
        }}

      >
        {/* Background */}
        <Rect
          width={node.width}
          height={node.height}
          fill="#eee"
          cornerRadius={8}
        />

        {/* Images */}
        {node.images.length > 0 ? (
          node.images.length >= 3 ? (
            // Show 3 images with looping (prev, current, next)
            [
              (node.activeIndex - 1 + node.images.length) % node.images.length,
              node.activeIndex,
              (node.activeIndex + 1) % node.images.length
            ].map((index, pos) => (
              imgElements[index] && (
                <KonvaImage
                  key={`carousel-${index}-${pos}`}
                  image={imgElements[index]}
                  x={(node.width / 3) * pos}
                  y={0}
                  width={node.width / 3}
                  height={node.height}
                  opacity={pos === 1 ? 1 : 0.6}
                  onClick={e => {
                    e.cancelBubble = true
                    openFilePicker()
                  }}
                />
              )
            ))
          ) : (
            // Show all images side by side
            node.images.map((imageUrl, index) => (
              imgElements[index] && (
                <KonvaImage
                  key={imageUrl}
                  image={imgElements[index]}
                  x={(node.width / node.images.length) * index}
                  y={0}
                  width={node.width / node.images.length}
                  height={node.height}
                  onClick={e => {
                    e.cancelBubble = true
                    openFilePicker()
                  }}
                />
              )
            ))
          )
        ) : (
          <Text
            text="Click to add images"
            width={node.width}
            height={node.height}
            align="center"
            verticalAlign="middle"
            fill="#666"
            onClick={e => {
              e.cancelBubble = true
              openFilePicker()
            }}
          />
        )}

        {/* Prev */}
        {node.images.length >= 3 && (
          <Text
            text="<"
            x={5}
            y={node.height / 2 - 10}
            fontSize={20}
            onClick={e => {
              e.cancelBubble = true
              onUpdate(node.id, {
                activeIndex:
                  (node.activeIndex - 1 + node.images.length) %
                  node.images.length
              })
            }}
          />
        )}

        {/* Next */}
        {node.images.length >= 3 && (
          <Text
            text=">"
            x={node.width - 15}
            y={node.height / 2 - 10}
            fontSize={20}
            onClick={e => {
              e.cancelBubble = true
              onUpdate(node.id, {
                activeIndex:
                  (node.activeIndex + 1) % node.images.length
              })
            }}
          />
        )}
      </Group>

      {!preview && selected && <Transformer ref={trRef} rotateEnabled />}
      {/* Action bar – SAME AS VIDEO */}
      {!preview && selected && (
        <Group x={actionPos.x} y={actionPos.y} listening>
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
          />

          {/* Position */}
          <Text
            text={`Position ${posDown ? "↑" : "↓"}`}
            x={72}
            y={8}
            fontSize={12}
            onClick={togglePosition}
          />
        </Group>
      )}
    </>
  )
}
