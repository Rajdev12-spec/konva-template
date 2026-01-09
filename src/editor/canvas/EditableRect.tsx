import { Rect, Transformer } from "react-konva"
import { useEffect, useRef } from "react"
import type { RectNode } from "../../types/editor"

type Props = {
  node: RectNode
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, attrs: Partial<RectNode>) => void
}

export default function EditableRect({
  node,
  selected,
  onSelect,
  onUpdate
}: Props) {
  const ref = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [selected])

  return (
    <>
      <Rect
        ref={ref}
        {...node}
        draggable
        onClick={onSelect}
        onDragEnd={e =>
          onUpdate(node.id, {
            x: e.target.x(),
            y: e.target.y()
          })
        }
        onTransformEnd={() => {
          const r = ref.current
          onUpdate(node.id, {
            width: r.width() * r.scaleX(),
            height: r.height() * r.scaleY(),
            rotation: r.rotation()
          })
          r.scaleX(1)
          r.scaleY(1)
        }}
      />

      {selected && <Transformer ref={trRef} />}
    </>
  )
}
