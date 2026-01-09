export type TextNode = {
  id: string
  type: "text"
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: string
  fill: string
  rotation: number
}

export type RectNode = {
  id: string
  type: "rect"
  x: number
  y: number
  width: number
  height: number
  fill: string
  rotation: number
}

export type CanvasNode = TextNode | RectNode
