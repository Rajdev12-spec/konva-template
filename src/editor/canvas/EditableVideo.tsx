import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Group, Image, Path, Rect, Text, Transformer } from "react-konva"
import type { CanvasNode, VideoNode } from "../../types/editor"


type Props = {
  node: VideoNode
  selected: boolean
  preview: boolean
  onSelect: () => void
  setSelectedId: (id: string | null) => void
  onUpdate: (id: string, attrs: Partial<VideoNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
}

export default function EditableVideo({
  node,
  selected,
  preview,
  onSelect,
  setNodes,
  onUpdate,
  setSelectedId,
}: Props) {

  const imageRef = useRef<Konva.Image>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [, forceRender] = useState(0)
  const [posDown, setPosDown] = useState(false)
  const [origIndex, setOrigIndex] = useState<number | null>(null)
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 })


  /* Create video element */
  useEffect(() => {
    const video = document.createElement("video")
    video.src = node.src ?? ""
    video.crossOrigin = "anonymous"
    video.loop = true
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      video.play()
      forceRender(v => v + 1)
    }

    videoRef.current = video

    return () => {
      video.pause()
      videoRef.current = null
    }
  }, [node.src])

  useEffect(() => {
    if (!videoRef.current) return

    if (node.muted !== undefined) {
      videoRef.current.muted = node.muted
    }

    if (node.isPlaying === false) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => { })
    }
  }, [node.isPlaying, node.muted])


  /* Attach transformer */
  useEffect(() => {
    if (selected && trRef.current && imageRef.current && !preview) {
      trRef.current.nodes([imageRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, preview])

  /* Redraw video frames */
  useEffect(() => {
    if (!videoRef.current) return

    const layer = imageRef.current?.getLayer()
    let animId: number

    const draw = () => {
      layer?.batchDraw()
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  useEffect(() => {
    if (!selected || !imageRef.current) return
    const box = imageRef.current.getClientRect()
    const barWidth = 150
    const barHeight = 40
    const x = box.x + box.width / 2 - barWidth / 2
    const y = box.y - barHeight - 8
    setActionPos({ x, y })
  }, [selected, node.x, node.y, node.width, node.height, node.rotation, node.src])


  const duplicateNode = () => {
    const copy = { ...node, id: crypto.randomUUID(), x: node.x + 10, y: node.y + 10 }
    setNodes((prev: any[]) => [...prev, copy])
    setSelectedId(copy.id)
  }

  const deleteNode = () => {
    setNodes((prev: any[]) => prev.filter(n => n.id !== node.id))
    setSelectedId(null)
  }

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

  return (
    <>
      <Image
        ref={imageRef}
        image={videoRef.current as any}
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rotation={node.rotation}
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
          const r = imageRef.current
          if (!r) return

          onUpdate(node.id, {
            width: Math.max(10, r.width() * r.scaleX()),
            height: Math.max(10, r.height() * r.scaleY()),
            rotation: r.rotation()
          })

          r.scaleX(1)
          r.scaleY(1)
        }}
      />

      {!preview && selected &&
        <>
          <Transformer ref={trRef} />
          <Group x={actionPos.x} y={actionPos.y} listening>
            <Rect width={150} height={40} cornerRadius={6} fill="#ffffff" stroke="#d1d5db" shadowColor="#000" shadowBlur={6} shadowOpacity={0.06} />
            <Path
              data="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z"
              x={12}
              y={9}
              scaleX={0.85}
              scaleY={0.85}
              fill="#111827"
              onClick={duplicateNode}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />

            <Path
              data="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17"
              x={40}
              y={9}
              scaleX={0.85}
              scaleY={0.85}
              fill="#111827"
              onClick={deleteNode}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />

            <Text
              text={`Position ${posDown ? '↑' : '↓'}`}
              x={72}
              y={8}
              fontSize={12}
              onClick={togglePosition}
              onMouseEnter={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'pointer' } }}
              onMouseLeave={e => { const stage = e.target.getStage(); if (stage && stage.container()) { stage.container().style.cursor = 'default' } }}
            />
          </Group>

        </>
      }
    </>
  )
}
