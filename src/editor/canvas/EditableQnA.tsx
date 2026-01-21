import Konva from "konva"
import { Group, Rect, Text, Transformer } from "react-konva"
import { Html } from "react-konva-utils"
import { useEffect, useRef } from "react"

const MIN_WIDTH = 250
const MIN_HEIGHT = 150

type Props = {
  node: any
  selected: boolean
  preview: boolean
  onSelect: () => void
  onUpdate: (id: string, attrs: any) => void
}

export default function EditableQna({
  node,
  selected,
  preview,
  onSelect,
  onUpdate
}: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const trRef = useRef<Konva.Transformer>(null)

  const lineHeight = 60

  /* Attach transformer */
  useEffect(() => {
    if (selected && !preview && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected, preview])

  const handleSubmit = () => {
    const payload = {
      qnaId: node.id,
      answers: node.items.map((q: any) => ({
        question: q.question,
        answer: q.answer
      }))
    }

    console.log("QNA SUBMIT:", payload)

    // 👉 API call can go here
    // submitQna(payload)
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
          onUpdate(node.id, {
            x: e.target.x(),
            y: e.target.y()
          })
        }
        onTransformEnd={() => {
          const g = groupRef.current
          if (!g) return

          const scaleX = g.scaleX()
          const scaleY = g.scaleY()

          onUpdate(node.id, {
            width: Math.max(MIN_WIDTH, node.width * scaleX),
            height: Math.max(MIN_HEIGHT, node.height * scaleY)
          })

          g.scaleX(1)
          g.scaleY(1)
        }}
      >
        {/* Card */}
        <Rect
          width={node.width}
          height={node.height}
          fill="#ffffff"
          cornerRadius={8}
          shadowBlur={6}
          stroke="#e5e7eb"
        />

        {/* Header */}
        <Text
          text="Q & A"
          x={12}
          y={10}
          fontSize={16}
          fontStyle="bold"
          fill="#111827"
        />

        {/* Questions */}
        {node.items.map((item: any, index: number) => {
          const y = 40 + index * lineHeight

          return (
            <Group key={item.id}>
              <Text
                text={`${index + 1}. ${item.question}`}
                x={12}
                y={y}
                width={node.width - 24}
                fontSize={14}
              />

              {preview && (
                <Html groupProps={{ x: 12, y: y + 22 }}>
                  <input
                    value={item.answer}
                    placeholder="Type your answer..."
                    onChange={e => {
                      const items = node.items.map((q: any) =>
                        q.id === item.id
                          ? { ...q, answer: e.target.value }
                          : q
                      )
                      onUpdate(node.id, { items })
                    }}
                    style={{
                      width: `${node.width - 24}px`,
                      padding: "6px 8px",
                      fontSize: "13px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px"
                    }}
                  />
                </Html>
              )}
            </Group>
          )
        })}

        {/* Submit Button */}
        {preview && (
          <Html groupProps={{ x: 12, y: node.height - 48 }}>
            <button
              onClick={handleSubmit}
              style={{
                width: `${node.width - 24}px`,
                padding: "10px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500
              }}
            >
              Submit
            </button>
          </Html>
        )}
      </Group>

      {/* Transformer */}
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
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < MIN_WIDTH || newBox.height < MIN_HEIGHT
              ? oldBox
              : newBox
          }
        />
      )}
    </>
  )
}
