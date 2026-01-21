import type { CanvasNode, CardNode, CarouselNode, ImageNode, LinkNode, ProfileCardNode, RectNode, TextNode, VideoNode } from "../../types/editor";
import Canvas from "../canvas/Canvas"
interface ViewModeProps {
    nodes: CanvasNode[];
    selectedId: string | null;
    previewMode: boolean;
    updateNode: (id: string,
        attrs: Partial<TextNode> | Partial<RectNode> | Partial<ImageNode> | Partial<VideoNode> | Partial<CarouselNode> | Partial<LinkNode> | Partial<CardNode> | Partial<ProfileCardNode>) => void;
    setSelectedId: (id: string | null) => void;
    setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>;
}

const ViewMode = ({ nodes, previewMode, selectedId, setSelectedId, setNodes, updateNode }: ViewModeProps) => {

    return (
        <div className="min-h-screen">
            <Canvas
                nodes={nodes}
                selectedId={previewMode ? null : selectedId}
                setSelectedId={previewMode ? () => { } : setSelectedId}
                updateNode={previewMode ? () => { } : updateNode}
                setNodes={previewMode ? () => { } : setNodes}
                preview={previewMode}
            />
        </div>
    )
}

export default ViewMode
