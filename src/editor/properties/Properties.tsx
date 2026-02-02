import React, { useEffect, useRef } from "react"
import { ContentCopy, DeleteRounded } from "../../assets/icons"
import type { CanvasNode, CardNode, ImageNode, LinkNode, ProfileCardNode, RectNode, TextNode, VideoNode } from "../../types/editor"

type Props = {
  nodes: CanvasNode[]
  selectedId: string | null
  updateNode: (
    id: string,
    attrs: Partial<CanvasNode>
  ) => void
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
  setSelectedId: (id: string | null) => void
}

export default function Properties({
  nodes,
  selectedId,
  updateNode,
  setNodes,
  setSelectedId
}: Props) {
  const node = nodes.find(n => n.id === selectedId)
  if (!node) return <div style={{ width: 250 }} />

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
    setSelectedId(null)
  }

  const duplicateNode = (n: CanvasNode) => {
    const copy = { ...n, id: crypto.randomUUID(), x: (n as any).x + 10, y: (n as any).y + 10 }
    setNodes([...nodes, copy])
    setSelectedId(copy.id)
  }

  const renderCommon = (n: CanvasNode) => (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => duplicateNode(n)}
          title="Duplicate"
          className="cursor-pointer"
        >
          <ContentCopy />
        </button>
        <button
          onClick={() => deleteNode(n.id)}
          title="Delete"
          className="cursor-pointer"

        >
          <DeleteRounded />
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>
          X:
          <input
            type="number"
            value={(n as any).x}
            onChange={e => updateNode(n.id, { x: +e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          Y:
          <input
            type="number"
            value={(n as any).y}
            onChange={e => updateNode(n.id, { y: +e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>
      </div>
    </div>
  )

  if (node.type === "text") {
    const n = node as TextNode
    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Text Properties</h4>

        <input
          value={n.text}
          onChange={e =>
            updateNode(n.id, { text: e.target.value })
          }
        />

        <input
          type="number"
          value={n.fontSize}
          onChange={e =>
            updateNode(n.id, { fontSize: +e.target.value })
          }
        />

        <div style={{ marginTop: 8 }}>
          <label style={{ display: "block" }}>
            Color:
            <input
              type="color"
              value={n.fill}
              onChange={e => updateNode(n.id, { fill: e.target.value })}
              style={{ marginTop: 6 }}
            />
          </label>
        </div>

        {renderCommon(n)}
      </div>
    )
  }

  if (node.type === "rect") {
    const n = node as RectNode
    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Rect Properties</h4>

        <input
          type="color"
          value={n.fill}
          onChange={e =>
            updateNode(n.id, { fill: e.target.value })
          }
        />

        {renderCommon(n)}
      </div>
    )
  }

  if (node.type === "image") {
    const n = node as ImageNode
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      // if an image node is selected without src, open file dialog to help user
      if (!n.src && fileInputRef.current) {
        setTimeout(() => fileInputRef.current?.click(), 50)
      }
    }, [n.id])

    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Image Properties</h4>

        <div>
          <label style={{ display: "block" }}>
            Source:
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files && e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  updateNode(n.id, { src: reader.result as string })
                }
                reader.readAsDataURL(file)
              }}
              style={{ marginTop: 6 }}
            />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 8 }}>
          Width:
          <input
            type="number"
            value={n.width}
            onChange={e => updateNode(n.id, { width: +e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          Height:
          <input
            type="number"
            value={n.height}
            onChange={e => updateNode(n.id, { height: +e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          Rotation:
          <input
            type="number"
            value={n.rotation}
            onChange={e => updateNode(n.id, { rotation: +e.target.value })}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>

        {renderCommon(n)}
      </div>
    )
  }

  if (node.type === "video") {
    const n = node as VideoNode
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (!n.src && fileInputRef.current) {
        setTimeout(() => fileInputRef.current?.click(), 50)
      }
    }, [n.id])

    return (
      <div className="w-62.5 p-3 space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">
          Video Properties
        </h4>

        {/* Upload / Replace */}
        <label className="block space-y-1 text-xs font-medium text-gray-600">
          <span>Source</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="block w-full text-xs
            file:mr-2 file:rounded-md file:border-0
            file:bg-gray-100 file:px-3 file:py-1.5
            file:text-xs file:font-medium
            hover:file:bg-gray-200"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const url = URL.createObjectURL(file)
              updateNode(n.id, {
                src: url,
                isPlaying: true,
                muted: true
              })
            }}
          />
        </label>

        {/* ▶️ Play / Pause & 🔇 Mute */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateNode(n.id, { isPlaying: !n.isPlaying })
            }
            className="flex-1 rounded-md bg-blue-600 px-3 py-1.5
            text-xs font-medium text-white cursor-pointer
            hover:bg-blue-700 active:scale-[0.98]"
          >
            {n.isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={() =>
              updateNode(n.id, { muted: !n.muted })
            }
            className="flex-1 rounded-md bg-gray-600 px-3 py-1.5
            text-xs font-medium text-white cursor-pointer
            hover:bg-gray-700 active:scale-[0.98]"
          >
            {n.muted ? "Unmute" : "Mute"}
          </button>
        </div>

        {/* Width */}
        <label className="block space-y-1 text-xs font-medium text-gray-600">
          <span>Width</span>
          <input
            type="number"
            value={n.width}
            onChange={e => updateNode(n.id, { width: +e.target.value })}
            className="w-full rounded-md border border-gray-300
            px-2 py-1 text-xs
            focus:border-blue-500 focus:outline-none"
          />
        </label>

        {/* Height */}
        <label className="block space-y-1 text-xs font-medium text-gray-600">
          <span>Height</span>
          <input
            type="number"
            value={n.height}
            onChange={e => updateNode(n.id, { height: +e.target.value })}
            className="w-full rounded-md border border-gray-300
            px-2 py-1 text-xs
            focus:border-blue-500 focus:outline-none"
          />
        </label>

        {/* Rotation */}
        <label className="block space-y-1 text-xs font-medium text-gray-600">
          <span>Rotation</span>
          <input
            type="number"
            value={n.rotation}
            onChange={e => updateNode(n.id, { rotation: +e.target.value })}
            className="w-full rounded-md border border-gray-300
            px-2 py-1 text-xs
            focus:border-blue-500 focus:outline-none"
          />
        </label>

        {renderCommon(n)}
      </div>
    )
  }

  if (node.type === "link") {
    const n = node as LinkNode

    return (
      <div className="p-4 space-y-3" key={n.id}>
        <h4 className="font-semibold">Link Properties</h4>

        <input
          className="w-full border p-1"
          value={n.text}
          onChange={e => updateNode(n.id, { text: e.target.value })}
          placeholder="Link text"
        />

        <input
          className="w-full border p-1"
          value={n.href}
          onChange={e => updateNode(n.id, { href: e.target.value })}
          placeholder="https://example.com"
        />

        <input
          type="number"
          className="w-full border p-1"
          value={n.fontSize}
          onChange={e => updateNode(n.id, { fontSize: +e.target.value })}
        />

        <label className="block">
          Background
          <input
            type="color"
            value={n.fill}
            onChange={e => updateNode(n.id, { fill: e.target.value })}
          />
        </label>

        <label className="block">
          Text color
          <input
            type="color"
            value={n.textColor}
            onChange={e => updateNode(n.id, { textColor: e.target.value })}
          />
        </label>

        {renderCommon(n)}
      </div>
    )
  }

  if (node.type === "card") {
    const n = node as CardNode
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (!n.image && fileInputRef.current) {
        setTimeout(() => fileInputRef.current?.click(), 50)
      }
    }, [n.id])

    return (
      <div className="p-4 space-y-3">
        <h4 className="font-semibold">Card Properties</h4>

        {/* Upload / Replace Image */}
        <label className="block text-xs font-medium text-gray-600">
          Card Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="block w-full mt-1 text-xs
          file:mr-2 file:rounded-md file:border-0
          file:bg-gray-100 file:px-3 file:py-1.5
          hover:file:bg-gray-200"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const url = URL.createObjectURL(file)
              updateNode(n.id, { image: url })
            }}
          />
        </label>

        {/* Title */}
        <input
          type="text"
          value={n.title}
          onChange={e => updateNode(n.id, { title: e.target.value })}
          placeholder="Title"
          className="w-full border p-1 text-xs rounded-md"
        />

        {/* Description */}
        <textarea
          value={n.description}
          onChange={e => updateNode(n.id, { description: e.target.value })}
          placeholder="Description"
          className="w-full border p-1 text-xs rounded-md"
        />

        {/* Width / Height */}
        <input
          type="number"
          value={n.width}
          onChange={e => updateNode(n.id, { width: +e.target.value })}
          className="w-full border p-1 text-xs rounded-md"
          placeholder="Width"
        />

        <input
          type="number"
          value={n.height}
          onChange={e => updateNode(n.id, { height: +e.target.value })}
          className="w-full border p-1 text-xs rounded-md"
          placeholder="Height"
        />
      </div>
    )
  }

  if (node.type === "profileCard") {
    const n = node as ProfileCardNode
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (!n.profileImage && fileInputRef.current) {
        setTimeout(() => fileInputRef.current?.click(), 50)
      }
    }, [n.id])

    return (
      <div className="p-4 space-y-3">
        <h4 className="font-semibold">Profile Card Properties</h4>

        {/* Upload / Replace Profile Image */}
        <label className="block text-xs font-medium text-gray-600">
          Profile Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="block w-full mt-1 text-xs
            file:mr-2 file:rounded-md file:border-0
            file:bg-gray-100 file:px-3 file:py-1.5
            hover:file:bg-gray-200"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const url = URL.createObjectURL(file)
              updateNode(n.id, { profileImage: url })
            }}
          />
        </label>

        {/* Name */}
        <input
          type="text"
          value={n.name}
          onChange={e => updateNode(n.id, { name: e.target.value })}
          placeholder="Name"
          className="w-full border p-1 text-xs rounded-md"
        />

        {/* Role */}
        <textarea
          value={n.role}
          onChange={e => updateNode(n.id, { role: e.target.value })}
          placeholder="Role / Description"
          className="w-full border p-1 text-xs rounded-md"
        />

        {/* Width / Height */}
        <input
          type="number"
          value={n.width}
          onChange={e => updateNode(n.id, { width: +e.target.value })}
          className="w-full border p-1 text-xs rounded-md"
          placeholder="Width"
        />

        <input
          type="number"
          value={n.height}
          onChange={e => updateNode(n.id, { height: +e.target.value })}
          className="w-full border p-1 text-xs rounded-md"
          placeholder="Height"
        />
      </div>
    )
  }

  if (node.type === "qna") {
    const n = node;

    const updateQuestion = (itemId: string, value: string) => {
      const items = n.items.map(item =>
        item.id === itemId ? { ...item, question: value } : item
      );
      updateNode(n.id, { items });
    };

    const addQuestion = () => {
      const newItem = {
        id: crypto.randomUUID(),
        question: "New Question?",
        answer: ""
      };
      updateNode(n.id, { items: [...n.items, newItem] });
    };

    const removeQuestion = (itemId: string) => {
      const items = n.items.filter(item => item.id !== itemId);
      updateNode(n.id, { items });
    };

    return (
      <div style={{ width: 250, padding: 10 }}>
        <h4>Q&A Properties</h4>

        {n.items.map(item => (
          <div key={item.id} style={{ marginBottom: 10, borderBottom: "1px solid #eee", paddingBottom: 6 }}>
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateQuestion(item.id, e.target.value)}
              style={{ width: "100%", marginBottom: 4 }}
            />
            <button
              onClick={() => removeQuestion(item.id)}
              style={{ color: "red", fontSize: 12 }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addQuestion}
          style={{ marginTop: 6, background: "#2563eb", color: "#fff", padding: "6px 12px", borderRadius: 4, fontSize: 13 }}
        >
          Add Question
        </button>

        <div style={{ marginTop: 12 }}>
          <label>
            X:
            <input
              type="number"
              value={n.x}
              onChange={e => updateNode(n.id, { x: +e.target.value })}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>

          <label style={{ display: "block", marginTop: 8 }}>
            Y:
            <input
              type="number"
              value={n.y}
              onChange={e => updateNode(n.id, { y: +e.target.value })}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
        </div>
      </div>
    );
  }
  if (node.type === "header") {
    const n = node

    const updateMenuItem = (id: string, attrs: Partial<{ label: string, href: string }>) => {
      updateNode(n.id, {
        menu: n.menu.map(m => m.id === id ? { ...m, ...attrs } : m)
      })
    }

    const addMenu = () => {
      updateNode(n.id, {
        menu: [...n.menu, { id: crypto.randomUUID(), label: "New Menu", href: "#" }]
      })
    }

    const removeMenu = (id: string) => {
      updateNode(n.id, {
        menu: n.menu.filter(m => m.id !== id)
      })
    }

    return (
      <div className="p-4 space-y-4">
        <h4 className="font-semibold text-gray-800">Header Settings</h4>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Logo Text</label>
          <input
            value={n.logoText}
            onChange={e => updateNode(n.id, { logoText: e.target.value })}
            className="w-full border rounded-md p-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-700">Menu Links</h5>
            <button
              onClick={addMenu}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition font-medium"
            >
              + Add
            </button>
          </div>

          <div className="space-y-4">
            {n.menu.map(m => (
              <div key={m.id} className="p-3 border rounded-lg bg-gray-50 space-y-2 relative group">
                <button
                  onClick={() => removeMenu(m.id)}
                  className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 text-xs hover:bg-red-50 hover:text-red-500 transition"
                  title="Remove link"
                >
                  ❌
                </button>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Label</label>
                  <input
                    value={m.label}
                    onChange={e => updateMenuItem(m.id, { label: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs bg-white focus:border-blue-500 focus:outline-none"
                    placeholder="Label"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">URL (Href)</label>
                  <input
                    value={m.href}
                    onChange={e => updateMenuItem(m.id, { href: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs bg-white focus:border-blue-500 focus:outline-none"
                    placeholder="#"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }



  if (node.type === "footer") {
    const n = node
    return (
      <div className="p-4 space-y-4">
        <h4 className="font-semibold text-gray-800">Footer Settings</h4>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Copyright Text</label>
          <input
            value={n.text}
            onChange={e => updateNode(n.id, { text: e.target.value })}
            className="w-full border rounded-md p-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={n.background}
              onChange={e => updateNode(n.id, { background: e.target.value })}
              className="w-10 h-10 border rounded-md p-1"
            />
            <input
              type="text"
              value={n.background}
              onChange={e => updateNode(n.id, { background: e.target.value })}
              className="flex-1 border rounded-md p-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
