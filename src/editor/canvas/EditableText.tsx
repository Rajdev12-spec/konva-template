import { useEffect, useRef, useState } from "react";
import { Group, Path, Rect, Text, Transformer } from "react-konva";
import type { CanvasNode, TextNode } from "../../types/editor";

type Props = {
  node: TextNode;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, attrs: Partial<TextNode>) => void;
  preview?: boolean;
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>;
  setSelectedId: (id: string | null) => void;
};

export default function EditableResizableText({
  node,
  selected,
  onSelect,
  onUpdate,
  preview,
  setNodes,
  setSelectedId,
}: Props) {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [editing, setEditing] = useState(false);
  const [posDown, setPosDown] = useState(false);
  const [origIndex, setOrigIndex] = useState<number | null>(null);

  // Action bar position
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 });

  // Attach Transformer to node
  useEffect(() => {
    if (selected && !editing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, editing]);

  useEffect(() => {
    if (!selected || !textRef.current) return;

    const node = textRef.current;
    const stage = node.getStage();
    if (!stage) return;

    const scale = stage.scaleX();

    // IMPORTANT: ignore rotation & scale
    const box = node.getClientRect({ skipTransform: true });

    const barWidth = 120;
    const barHeight = 28;

    const x =
      (node.x() + box.width / 2 - barWidth / 2) * scale;

    const y =
      (node.y() - barHeight - 10) * scale;

    setActionPos({ x, y });
  }, [
    selected,
    node.x,
    node.y,
    node.text,
    node.fontSize,
    node.rotation,
  ]);


  // Inline text editing
  useEffect(() => {
    if (!editing) return;
    const textNode = textRef.current;
    if (!textNode) return;

    const stage = textNode.getStage();
    const layer = textNode.getLayer();
    if (!stage || !layer) return;

    const scale = stage.scaleX();
    const stageBox = stage.container().getBoundingClientRect();
    const textBox = textNode.getClientRect();

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = textNode.text();
    textarea.style.position = "absolute";
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.fontSize = `${textNode.fontSize() * scale}px`;
    textarea.style.color = textNode.fill();
    textarea.style.background = "transparent";
    textarea.style.border = "1px dashed #666";
    textarea.style.padding = "0";
    textarea.style.margin = "0";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.overflow = "hidden";
    textarea.style.lineHeight = textNode.lineHeight().toString();
    textarea.style.whiteSpace = "pre-wrap";
    textarea.style.wordBreak = "break-word";

    const updatePosition = () => {
      textarea.style.top = `${stageBox.top + (textBox.y + layer.y()) * scale}px`;
      textarea.style.left = `${stageBox.left + (textBox.x + layer.x()) * scale}px`;
      textarea.style.width = `${textBox.width * scale}px`;
      textarea.style.height = `${textBox.height * scale}px`;
      requestAnimationFrame(updatePosition);
    };
    let animationFrame = requestAnimationFrame(updatePosition);

    const finishEditing = () => {
      onUpdate(node.id, { text: textarea.value });
      textarea.remove();
      cancelAnimationFrame(animationFrame);
      setEditing(false);
    };

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        finishEditing();
      }
      if (e.key === "Escape") finishEditing();
    });

    textarea.addEventListener("blur", finishEditing);

    return () => {
      textarea.remove();
      cancelAnimationFrame(animationFrame);
    };
  }, [editing]);

  // Duplicate node
  const duplicateNode = () => {
    const copy = { ...node, id: crypto.randomUUID(), x: node.x + 10, y: node.y + 10 };
    setNodes((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // Delete node
  const deleteNode = () => {
    setNodes((prev) => prev.filter((n) => n.id !== node.id));
    setSelectedId(null);
  };

  // Move node up/down
  const togglePosition = () => {
    if (!posDown) {
      setNodes((prev) => {
        const idx = prev.findIndex((n) => n.id === node.id);
        if (idx <= 0) return prev;
        const arr = [...prev];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        setPosDown(true);
        setOrigIndex(idx);
        return arr;
      });
    } else {
      setNodes((prev) => {
        const currIdx = prev.findIndex((n) => n.id === node.id);
        if (currIdx === -1 || origIndex === null) return prev;
        const item = prev[currIdx];
        const rest = prev.filter((_, i) => i !== currIdx);
        const insertIndex = Math.min(Math.max(origIndex, 0), rest.length);
        const arr = [...rest.slice(0, insertIndex), item, ...rest.slice(insertIndex)];
        setPosDown(false);
        setOrigIndex(null);
        return arr;
      });
    }
  };

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
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={!preview ? () => setEditing(true) : undefined}
        onDragEnd={(e) => {
          if (preview) return;
          const stage = e.target.getStage();
          if (!stage) return;
          const scale = stage.scaleX();

          onUpdate(node.id, {
            x: e.target.x() / scale,
            y: e.target.y() / scale,
          });
        }}
        onTransformEnd={() => {
          if (preview || !textRef.current) return;

          const nodeRef = textRef.current;
          const stage = nodeRef.getStage();
          if (!stage) return;

          const scale = stage.scaleX();

          const newFontSize = Math.max(
            8,
            Math.round(nodeRef.fontSize() * nodeRef.scaleX() / scale)
          );

          nodeRef.scaleX(1);
          nodeRef.scaleY(1);

          onUpdate(node.id, {
            x: nodeRef.x() / scale,
            y: nodeRef.y() / scale,
            fontSize: newFontSize,
            rotation: nodeRef.rotation(),
          });
        }}
      />

      {selected && !editing && (
        <>
          <Transformer
            ref={trRef}
            rotateEnabled
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            boundBoxFunc={(oldBox, newBox) => {
              const stage = trRef.current?.getStage();
              const stageScale = stage?.scaleX() || 1;
              if (newBox.width / stageScale < 20) return oldBox;
              if (newBox.height / stageScale < 8) return oldBox;
              return newBox;
            }}
          />

          <Group x={actionPos.x} y={actionPos.y} listening rotation={0}>
            <Rect width={120} height={28} cornerRadius={6} fill="#f8f9fa" stroke="#d1d5db" />

            <Path
              data="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z"
              x={10} y={8} scaleX={0.9} scaleY={0.9} fill="#111827"
              onClick={duplicateNode}
            />

            <Path
              data="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17"
              x={38} y={8} scaleX={0.9} scaleY={0.9} fill="#111827"
              onClick={deleteNode}
            />

            <Text
              text={`Position ${posDown ? '↑' : '↓'}`}
              x={78} y={8} fontSize={12}
              onClick={togglePosition}
            />
          </Group>
        </>
      )}
    </>
  );
}
