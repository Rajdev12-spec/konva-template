import { Text, Transformer } from "react-konva"
import { useEffect, useRef, useState } from "react"
import type { TextNode } from "../../types/editor"

type Props = {
  node: TextNode
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, attrs: Partial<TextNode>) => void
  preview?: boolean
}


export default function EditableResizableText({
  node,
  selected,
  onSelect,
  onUpdate,
  preview
}: Props) {
  const textRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const [editing, setEditing] = useState(false)

  console.log('preview: ', preview)

  useEffect(() => {
    if (selected && !editing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, editing])

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

  return (
    <>
      <Text
        ref={textRef}
        {...node}
        draggable={!preview && !editing}
        visible={!editing}
        onClick={!preview ? onSelect : undefined}
        onTap={!preview ? onSelect : undefined}
        onDblClick={!preview ? () => setEditing(true) : undefined}
        onDragEnd={e => {
          if (preview) return
          onUpdate(node.id, { x: e.target.x(), y: e.target.y() })
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
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 ? oldBox : newBox)}
        />
      )}
    </>
  )
}
