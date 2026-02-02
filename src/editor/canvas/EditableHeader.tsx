import { Group, Rect, Text } from "react-konva"
import type { HeaderNode } from "../../types/editor"

type Props = {
  node: HeaderNode
  selected: boolean
  onSelect: () => void
  preview: boolean
}

export default function EditableHeader({ node, onSelect, preview }: Props) {
  const HEADER_WIDTH = 1200; // Match BASE_CANVAS.width

  return (
    <Group
      x={0}
      y={0}
      onClick={onSelect}
    >
      <Rect
        width={HEADER_WIDTH}
        height={node.height}
        fill={node.background}
      />

      {/* Logo */}
      <Text
        x={20}
        y={25}
        text={node.logoText}
        fontSize={24}
        fontStyle="bold"
        fill="white"
      />

      {/* Menu */}
      {node.menu.map((item, index) => (
        <Text
          key={item.id}
          x={HEADER_WIDTH - (node.menu.length - index) * 110}
          y={28}
          text={item.label}
          fontSize={18}
          fill="white"
          cursor={preview ? "pointer" : "default"}
          onClick={(e) => {
            if (preview && item.href) {
              e.cancelBubble = true;
              window.open(item.href, "_blank");
            }
          }}
        />
      ))}
    </Group>
  )
}
