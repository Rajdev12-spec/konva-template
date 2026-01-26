import { Text, Transformer, Group, Rect, Path } from "react-konva"
import { useEffect, useRef, useState } from "react"
import type { CanvasNode, TextNode } from "../../types/editor"
import { BASE_CANVAS } from "../Editor"

type Props = {
  node: TextNode
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, attrs: Partial<TextNode>) => void
  preview?: boolean
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  setSelectedId: (id: string | null) => void
  deviceSizes: { width: number, height: number }
}


export default function EditableResizableText({
  node,
  selected,
  onSelect,
  onUpdate,
  preview,
  setNodes,
  setSelectedId,
  deviceSizes
}: Props) {
  const textRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const [editing, setEditing] = useState(false)
  const [posDown, setPosDown] = useState(false)
  const [origIndex, setOrigIndex] = useState<number | null>(null)
  // compute action bar position centered above the Text node
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 })


  useEffect(() => {
    if (selected && !editing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, editing])


  useEffect(() => {
    if (!selected || !textRef.current) return
    const box = textRef.current.getClientRect()
    const barWidth = 120
    const barHeight = 28
    const x = box.x + box.width / 2 - barWidth / 2
    const y = box.y - barHeight - 8
    setActionPos({ x, y })
  }, [selected, node.x, node.y, node.text, node.fontSize, node.rotation])

  useEffect(() => {
    if (!editing) return

    const textNode = textRef.current
    const stage = textNode.getStage()
    const stageBox = stage.container().getBoundingClientRect()
    const textBox = textNode.getClientRect()

    const textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textarea.value = textNode.text()
    textarea.style.position = "absolute"
    textarea.style.top = `${stageBox.top + textBox.y}px`
    textarea.style.left = `${stageBox.left + textBox.x}px`
    textarea.style.width = `${textBox.width}px`
    textarea.style.height = `${textBox.height}px`
    textarea.style.fontSize = `${textNode.fontSize()}px`
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.color = textNode.fill()
    textarea.style.background = "transparent"
    textarea.style.border = "1px dashed #666"
    textarea.style.padding = "0"
    textarea.style.margin = "0"
    textarea.style.outline = "none"
    textarea.style.resize = "none"
    textarea.style.overflow = "hidden"
    textarea.style.lineHeight = textNode.lineHeight().toString()
    textarea.focus()

    const finishEditing = () => {
      onUpdate(node.id, { text: textarea.value })
      textarea.remove()
      setEditing(false)
    }

    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        finishEditing()
      }
      if (e.key === "Escape") {
        textarea.remove()
        setEditing(false)
      }
    })

    textarea.addEventListener("blur", finishEditing)

    return () => textarea.remove()
  }, [editing])

  const duplicateNode = () => {
    const copy = { ...node, id: crypto.randomUUID(), x: node.x + 10, y: node.y + 10 }
    setNodes((prev: CanvasNode[]) => [...prev, copy])
    setSelectedId(copy.id)
  }

  const deleteNode = () => {
    setNodes((prev: CanvasNode[]) => prev.filter(n => n.id !== node.id))
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
  const scaleX = deviceSizes.width / BASE_CANVAS.width
  const scaleY = deviceSizes.height / BASE_CANVAS.height

  return (
    <>
      <Text
        ref={textRef}
        x={node.x}
        y={node.y}
        text={node.text}
        fontFamily={node.fontFamily}
        fontSize={node.fontSize}
        fill={node.fill}
        rotation={node.rotation}
        draggable={!preview && !editing}
        visible={!editing}
        onClick={!preview ? onSelect : undefined}
        onTap={!preview ? onSelect : undefined}
        onDblClick={!preview ? () => setEditing(true) : undefined}
        onDragEnd={e => {
          if (preview) return
          onUpdate(node.id, { x: e.target.x()/scaleX, y: e.target.y()/scaleY })
        }}
        onTransformEnd={() => {
          if (preview) return

          const textNode = textRef.current
          const scaleX = textNode.scaleX()
          const newFontSize = Math.max(
            8,
            Math.round(textNode.fontSize() * scaleX)
          )

          textNode.scaleX(1)
          textNode.scaleY(1)

          onUpdate(node.id, {
            fontSize: newFontSize,
            rotation: textNode.rotation()
          })
        }}
      />

      {selected && !editing && (
        <>
          <Transformer
            ref={trRef}
            rotateEnabled
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 ? oldBox : newBox)}
          />

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
