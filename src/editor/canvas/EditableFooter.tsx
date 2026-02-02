import { Group, Rect, Text } from "react-konva"
import type { FooterNode } from "../../types/editor"

type Props = {
    node: FooterNode
    selected: boolean
    onSelect: () => void
    preview: boolean
}

export default function EditableFooter({ node, onSelect, preview }: Props) {
    const FOOTER_WIDTH = 1200; // Match BASE_CANVAS.width

    return (
        <Group
            x={0}
            y={node.y}
            onClick={onSelect}
            cursor={!preview ? "pointer" : "default"}
        >
            <Rect
                width={FOOTER_WIDTH}
                height={node.height}
                fill={node.background}
            />

            <Text
                x={0}
                y={node.height / 2 - 10}
                width={FOOTER_WIDTH}
                text={node.text}
                fontSize={16}
                align="center"
                fill="white"
            />
        </Group>
    )
}
