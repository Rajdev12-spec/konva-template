export type DeviceType = "mobile" | "tablet" | "desktop";

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

export type ImageNode = {
  id: string
  type: "image"
  x: number
  y: number
  width: number
  height: number
  src?: string
  rotation: number
}

export type VideoNode = {
  id: string
  type: "video"
  x: number
  y: number
  width: number
  height: number
  src?: string
  rotation: number
  isPlaying?: boolean
  muted?: boolean
}


export type LinkNode = {
  id: string
  type: "link"
  x: number
  y: number
  width: number
  height: number
  text: string
  href: string
  fontSize: number
  fill: string
  textColor: string
  radius: number
}


export type CardNode = {
  id: string
  type: "card"
  x: number
  y: number
  width: number
  height: number
  image?: string
  title: string
  description: string
  titleFontSize: number
  descriptionFontSize: number
}

export type ProfileCardNode = {
  id: string
  type: "profileCard"
  x: number
  y: number
  width: number
  height: number
  profileImage?: string
  name: string
  role: string
  nameFontSize?: number
  roleFontSize?: number
}
// types/editor.ts
export type CarouselNode = {
  id: string
  type: "carousel"
  x: number
  y: number
  width: number
  height: number
  images: string[]
  activeIndex: number
  autoplay?: boolean
  interval?: number
}
export type QnaItem = {
  id: string
  question: string
  answer: string
}

export type QnaNode = {
  id: string
  type: "qna"
  x: number
  y: number
  width: number
  height: number
  items: QnaItem[]
}




export type CanvasNode =
  TextNode
  | RectNode
  | ImageNode
  | VideoNode
  | LinkNode
  | CardNode
  | ProfileCardNode
  | CarouselNode
  | QnaNode