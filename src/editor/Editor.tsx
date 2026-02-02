import { useEffect, useState } from "react"
import { useUndoRedo } from "../hooks/useUndoRedo"
import type { CanvasNode, RectNode, TextNode, ImageNode, VideoNode, LinkNode, CardNode, ProfileCardNode, CarouselNode, QnaNode, DeviceType, HeaderNode, FooterNode } from "../types/editor"
import Canvas from "./canvas/Canvas"
import Header from "./header"
import Properties from "./properties/Properties"
import Sidebar from "./sidebar/Sidebar"

type DeviceSizes = {
    mobile: { width: number, height: number },
    tablet: { width: number, height: number },
    desktop: { width: number, height: number },
}

export const BASE_CANVAS = { width: 1200, height: 800 };

const deviceSizes: DeviceSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 },
};

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
    const [device, setDevice] = useState<DeviceType>("desktop");

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

    useEffect(() => {
        const data = localStorage.getItem('data')
        if (data) {
            const paredData = JSON.parse(data)
            setNodes(paredData)
        }
    }, [])

    const updateNode = (
        id: string,
        attrs: Partial<CanvasNode>

    ) => {
        setNodes(
            nodes.map(node => {
                if (node.id !== id) return node
                if (node.type === "text") return { ...node, ...(attrs as Partial<TextNode>) }
                if (node.type === "rect") return { ...node, ...(attrs as Partial<RectNode>) }
                if (node.type === "image") return { ...node, ...(attrs as Partial<ImageNode>) }
                if (node.type === "video") return { ...node, ...(attrs as Partial<VideoNode>) }
                if (node.type === "link") return { ...node, ...(attrs as Partial<LinkNode>) }
                if (node.type === "card") return { ...node, ...(attrs as Partial<CardNode>) }
                if (node.type === "profileCard") return { ...node, ...(attrs as Partial<ProfileCardNode>) }
                if (node.type === "carousel") return { ...node, ...(attrs as Partial<CarouselNode>) }
                if (node.type === "qna") return { ...node, ...(attrs as Partial<QnaNode>) }
                if (node.type === "header") return { ...node, ...(attrs as Partial<HeaderNode>) }
                if (node.type === "footer") return { ...node, ...(attrs as Partial<FooterNode>) }

                return node
            })
        )
    }

    const handlePublish = () => {
        localStorage.setItem('data', JSON.stringify(nodes))
    }

    const handleClosePreview = () => {
        setPreviewMode(false);
        setDevice("desktop");
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-[#f5f6f8] ">
            {/* HEADER */}
            <Header
                canRedo={canRedo}
                canUndo={canUndo}
                handlePublish={handlePublish}
                previewMode={previewMode}
                redo={redo}
                setPreviewMode={setPreviewMode}
                undo={undo}
                device={device}
                setDevice={setDevice}
                handleClosePreview={handleClosePreview}
            />


            {/* MAIN EDITOR */}
            <div className="flex flex-1 overflow-hidden">
                {!previewMode && (
                    <div className="w-64 h-full flex flex-col bg-white border-r border-gray-200">
                        <div className="flex-1 overflow-y-auto">
                            <Sidebar />
                        </div>
                    </div>
                )}


                {/* CANVAS AREA */}
                <div className="flex-1 bg-[#f5f6f8] overflow-auto">
                    <div className="min-h-full min-w-full flex items-center justify-center p-12">
                        <div
                            className="
                                    bg-white
                                    border border-gray-300
                                    shadow-[0_10px_40px_rgba(0,0,0,0.12)]
                                    "
                            style={{
                                width: "100%",
                                maxWidth: deviceSizes[device].width,
                                height: deviceSizes[device].height,
                                overflowY: "scroll",
                                overflowX: "auto",
                                scrollbarGutter: "stable",
                            }}

                        >
                            <Canvas
                                nodes={nodes}
                                selectedId={previewMode ? null : selectedId}
                                setSelectedId={previewMode ? () => { } : setSelectedId}
                                updateNode={updateNode}
                                setNodes={previewMode ? () => { } : setNodes}
                                preview={previewMode}
                                deviceSizes={deviceSizes[device]}
                            />
                        </div>
                    </div>
                </div>
                {!previewMode && (
                    <div className="w-80 h-full flex flex-col bg-white border-l border-gray-200">
                        <div className="flex-1 overflow-y-auto">
                            <Properties
                                nodes={nodes}
                                selectedId={selectedId}
                                updateNode={updateNode}
                                setNodes={setNodes}
                                setSelectedId={setSelectedId}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    )

}
