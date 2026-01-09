import { useEffect, useState } from "react"
import type { CanvasNode, RectNode, TextNode } from "../types/editor"
import Sidebar from "./sidebar/Sidebar"
import Canvas from "./canvas/Canvas"
import Properties from "./properties/Properties"
import { useUndoRedo } from "../hooks/useUndoRedo"
import { RedoIcon, UndoIcon } from "../assets/icons"

export default function Editor() {
    const {
        state: nodes,
        set: setNodes,
        undo,
        redo,
        canUndo,
        canRedo
    } = useUndoRedo<CanvasNode[]>([])
    const [previewMode, setPreviewMode] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)


    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                e.preventDefault()
                undo()
            }

            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "y" || (e.shiftKey && e.key === "Z"))
            ) {
                e.preventDefault()
                redo()
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [undo, redo])


    const updateNode = (
        id: string,
        attrs: Partial<TextNode> | Partial<RectNode>
    ) => {
        setNodes(
            nodes.map(node => {
                if (node.id !== id) return node

                if (node.type === "text") {
                    return { ...node, ...(attrs as Partial<TextNode>) }
                }

                if (node.type === "rect") {
                    return { ...node, ...(attrs as Partial<RectNode>) }
                }

                return node
            })
        )
    }

    const handlePublish = () => {
        localStorage.setItem('data', JSON.stringify(nodes))
    }

    useEffect(() => {
        const data = localStorage.getItem('data')
        if (data) {
            const paredData = JSON.parse(data)
            setNodes(paredData)
        }
    }, [])

    return (
        <div className="h-screen flex flex-col bg-[#f5f6f8]">
            {/* HEADER */}
            <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200">
                {/* Undo / Redo */}
                <div className="flex gap-3 items-center">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={`
                                border border-gray-300 rounded-lg p-1 transition
                                ${canUndo
                                ? "hover:bg-gray-100 cursor-pointer"
                                : "opacity-40 cursor-not-allowed"}
                            `}
                    >
                        <UndoIcon height={30} width={25} />
                    </button>

                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className={`
                                border border-gray-300 rounded-lg p-1 transition
                                ${canRedo
                                ? "hover:bg-gray-100 cursor-pointer"
                                : "opacity-40 cursor-not-allowed"}
                        `}
                    >
                        <RedoIcon height={30} width={25} />
                    </button>
                </div>

                <div className="flex gap-2">
                    {!previewMode ? (
                        <button
                            onClick={() => setPreviewMode(true)}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                        >
                            Preview
                        </button>
                    ) : (
                        <button
                            onClick={() => setPreviewMode(false)}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                        >
                            Exit Preview
                        </button>
                    )}

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" onClick={handlePublish}>
                        Publish
                    </button>
                </div>

            </div>

            {/* MAIN EDITOR */}
            {/* MAIN EDITOR */}
            <div className="flex flex-1 overflow-hidden">
                {!previewMode && (
                    <div className="w-64 bg-white border-r border-gray-200">
                        <Sidebar />
                    </div>
                )}

                {/* CANVAS AREA */}
                <div className="flex-1 flex items-center justify-center bg-[#f5f6f8]">
                    <div className="bg-white rounded-lg shadow-lg p-3">
                        <Canvas
                            nodes={nodes}
                            selectedId={previewMode ? null : selectedId}
                            setSelectedId={previewMode ? () => { } : setSelectedId}
                            updateNode={previewMode ? () => { } : updateNode}
                            setNodes={previewMode ? () => { } : setNodes}
                            preview={previewMode} // 👈 pass flag
                        />
                    </div>
                </div>

                {!previewMode && (
                    <div className="w-72 bg-white border-l border-gray-200">
                        <Properties
                            nodes={nodes}
                            selectedId={selectedId}
                            updateNode={updateNode}
                        />
                    </div>
                )}
            </div>

        </div>
    )

}
