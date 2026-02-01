import type { CanvasNode } from "../types/editor";

function getNodeHeight(node: CanvasNode): number {
  // Explicit height (Rect, Image)
  if (typeof node.height === "number") {
    return node.height;
  }

  // Text node
  if (node.type === "text") {
    const fontSize = node.fontSize ?? 16;
    const lineHeight = node.lineHeight ?? 1.2;
    const lines = node.text?.split("\n").length ?? 1;

    return fontSize * lineHeight * lines;
  }

  // Circle
  if (node.type === "circle") {
    return (node.radius ?? 20) * 2;
  }

  // Line / Arrow
  if (node.type === "line") {
    return 20; // visual thickness fallback
  }

  // Group
  if (node.type === "group") {
    return node.children?.reduce((max, child) => {
      return Math.max(max, getNodeHeight(child));
    }, 0) ?? 50;
  }

  // Absolute fallback
  return 50;
}
