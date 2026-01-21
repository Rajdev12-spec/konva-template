// Canvas.tsx
import { useRef, useState } from "react"
import { Layer, Stage } from "react-konva"
import type { CanvasNode, CarouselNode, ImageNode, RectNode, TextNode, VideoNode } from "../../types/editor"
import EditableCard from "./EditableCard"
import EditableCarousel from "./EditableCarousel"
import EditableImage from "./EditableImage"
import EditableLink from "./EditableLink"
import EditableProfileCard from "./EditableProfileCard"
import EditableQna from "./EditableQnA"
import EditableRect from "./EditableRect"
import EditableResizableText from "./EditableText"
import EditableVideo from "./EditableVideo"

type Props = {
  nodes: CanvasNode[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  updateNode: (id: string, attrs: Partial<CanvasNode>) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  preview: boolean
}

export default function Canvas({ nodes, selectedId, setSelectedId, updateNode, setNodes, preview }: Props) {
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const cardImageInputRef = useRef<HTMLInputElement | null>(null)
  const carouselImageInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("nodeType") as
      | "text"
      | "rect"
      | "image"
      | "video"
      | "link"
      | "card"
      | "profileCard"
      | "carousel"
      | "qna"

    const bounds = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const y = e.clientY - bounds.top

    if (type === "text") {
      const newNode: TextNode = {
        id: crypto.randomUUID(),
        type: "text",
        x,
        y,
        text: "New Text",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "#000",
        rotation: 0
      }
      setNodes(prev => [...prev, newNode])
    }

    if (type === "rect") {
      const newNode: RectNode = {
        id: crypto.randomUUID(),
        type: "rect",
        x,
        y,
        width: 150,
        height: 100,
        fill: "black",
        rotation: 0
      }
      setNodes(prev => [...prev, newNode])
    }

    if (type === "image") {
      const newNode: ImageNode = {
        id: crypto.randomUUID(),
        type: "image",
        x,
        y,
        width: 200,
        height: 150,
        src: undefined,
        rotation: 0
      }
      setNodes(prev => [...prev, newNode])
      setSelectedId(newNode.id)
    }

    if (type === "video") {
      const newNode: VideoNode = {
        id: crypto.randomUUID(),
        type: "video",
        x,
        y,
        width: 300,
        height: 200,
        rotation: 0,
        src: undefined,
        isPlaying: true,
        muted: true
      }

      setNodes(prev => [...prev, newNode])
      setSelectedId(newNode.id)
    }
    if (type === "link") {
      setNodes(nodes => [
        ...nodes,
        {
          id: crypto.randomUUID(),
          type: "link",
          x,
          y,
          width: 160,
          height: 40,
          text: "Visit website",
          href: "https://example.com",
          fontSize: 16,
          fill: "#2563eb",
          textColor: "#ffffff",
          radius: 6
        }
      ])
    }

    if (type === "card") {
      setNodes(nodes => [
        ...nodes,
        {
          id: crypto.randomUUID(),
          type: "card",
          x,
          y,
          width: 250,
          height: 350,
          title: "Card Title",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7r0TBgU8-SuHKlgfTmNzdQoMrk3nU5tFarg&s",
          description: "This is a description of the card.",
          descriptionFontSize: 12,
          titleFontSize: 16
        }
      ])
    }
    if (type === "profileCard") {
      setNodes(nodes => [
        ...nodes,
        {
          id: crypto.randomUUID(),
          type: "profileCard",
          x,
          y,
          width: 200,
          height: 300,
          name: "Name",
          role: "Role / Description",
          profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1fiSQO7JfDw0uv1Ae_Ye-Bo9nhGNg27dwg&s",
          nameFontSize: 16,
          roleFontSize: 12
        }
      ])
    }
    if (type === "carousel") {
      setNodes(nodes => [
        ...nodes,
        {
          id: crypto.randomUUID(),
          type: "carousel",
          x,
          y,
          width: 800,
          height: 300,
          activeIndex: 0,
          autoplay: true,
          interval: 3000,
          images: []
        }
      ])
    }
    if (type === "qna") {
      setNodes(nodes => [
        ...nodes,
        {
          id: crypto.randomUUID(),
          type: "qna",
          x,
          y,
          width: 420,
          height: 220,
          items: [
            {
              id: crypto.randomUUID(),
              question: "What is your name?",
              answer: ""
            },
            {
              id: crypto.randomUUID(),
              question: "What is your email?",
              answer: ""
            }
          ]
        }
      ])
    }

  }


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  return (
    <div
      style={{ flex: 1 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        width={window.innerWidth - 400}
        height={window.innerHeight}
        onMouseDown={(e: any) => {
          // If click happens on empty stage background (not on a shape), deselect
          if (!preview && e.target === e.target.getStage()) {
            setSelectedId(null)
          }
        }}
      >
        <Layer>
          {nodes.map(node => {
            if (node.type === "text") {
              return (
                <EditableResizableText
                  key={node.id}
                  node={node}
                  selected={!preview && node.id === selectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                  onUpdate={preview ? () => { } : updateNode}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                />
              )
            }
            if (node.type === "rect") {
              return (
                <EditableRect
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                  onUpdate={updateNode}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                />
              )
            }

            if (node.type === "image") {
              return (
                <EditableImage
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                  onUpdate={updateNode}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                />
              )
            }
            if (node.type === "video") {
              return (
                <EditableVideo
                  key={node.id}
                  node={node}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                  onUpdate={preview ? () => { } : updateNode}
                  selected={!preview && node.id === selectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                />
              )
            }

            if (node.type === "link") {
              return (
                <EditableLink
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                  onSelect={() => setSelectedId(node.id)}
                  onUpdate={updateNode}
                />
              )
            }

            if (node.type === "card") {
              return (
                <EditableCard
                  key={node.id}
                  node={node}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                  onUpdate={preview ? () => { } : updateNode}
                  selected={!preview && node.id === selectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                />
              )
            }

            if (node.type === "profileCard") {
              return (
                <EditableProfileCard
                  key={node.id}
                  node={node}
                  selected={!preview && node.id === selectedId}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                  onUpdate={preview ? () => { } : updateNode}
                />
              )
            }

            if (node.type === "carousel") {
              return (
                <EditableCarousel
                  key={node.id}
                  node={node}
                  selected={!preview && node.id === selectedId}
                  preview={preview}
                  setNodes={setNodes}
                  setSelectedId={setSelectedId}
                  onSelect={() => !preview && setSelectedId(node.id)}
                  onUpdate={(id, attrs) => {
                    updateNode(id, attrs)
                  }}

                  openFilePicker={() => {
                    setSelectedId(node.id)
                    carouselImageInputRef.current?.click()
                  }}

                />
              )
            }

            if (node.type === "qna") {
              return (
                <EditableQna
                  key={node.id}
                  node={node}
                  selected={!preview && node.id === selectedId}
                  preview={preview}
                  onSelect={() => !preview && setSelectedId(node.id)}
                  onUpdate={updateNode}
                />
              )
            }
            return null
          })}

        </Layer>
      </Stage>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file || !selectedId) return

          const url = URL.createObjectURL(file)
          updateNode(selectedId, { src: url })

          e.target.value = ""
        }}
      />
      <input
        ref={cardImageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          if (isUploading) return
          setIsUploading(true)
          const file = e.target.files?.[0]
          if (!file || !selectedId) {
            setIsUploading(false)
            return
          }

          const url = URL.createObjectURL(file)
          updateNode(selectedId, { image: url })

          e.target.value = ""
          setIsUploading(false)
        }}
      />
      <input
        ref={carouselImageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => {
          if (isUploading) return
          setIsUploading(true)
          const files = Array.from(e.target.files || [])
          if (files.length === 0 || !selectedId) {
            setIsUploading(false)
            return
          }

          const urls = files.map(file => URL.createObjectURL(file))
          setNodes(nodes =>
            nodes.map(node =>
              node.id === selectedId && node.type === "carousel"
                ? { ...node, images: [...(node as CarouselNode).images, ...urls] }
                : node
            )
          )
          e.target.value = ""
          setIsUploading(false)
        }}
      />

    </div>
  )
}
