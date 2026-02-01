import { Group, Rect, Text } from "react-konva"
import type { HeaderNode } from "../../types/editor"

type Props = {
  node: HeaderNode
  selected: boolean
  onSelect: () => void
  preview: boolean
}

export default function EditableHeader({ node, onSelect }: Props) {
  return (
    <Group
      x={node.x}
      y={node.y}
      onClick={onSelect}
      draggable
    >
      <Rect
        width={node.width}
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
          x={node.width - (node.menu.length - index) * 100}
          y={28}
          text={item.label}
          fontSize={18}
          fill="white"
        />
      ))}
    </Group>
  )
}
