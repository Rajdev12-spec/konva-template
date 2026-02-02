import type { CanvasNode } from "../../types/editor";
import Canvas from "../canvas/Canvas";
interface ViewModeProps {
    nodes: CanvasNode[];
    selectedId: string | null;
    previewMode: boolean;
    updateNode: (id: string, attrs: Partial<CanvasNode>) => void
    setSelectedId: (id: string | null) => void;
    setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>;
    deviceSizes: { width: number, height: number }
}

const ViewMode = ({ nodes, previewMode, selectedId, setSelectedId, setNodes, updateNode, deviceSizes }: ViewModeProps) => {

    return (
        <div className="min-h-screen">
            <Canvas
                nodes={nodes}
                selectedId={previewMode ? null : selectedId}
                setSelectedId={previewMode ? () => { } : setSelectedId}
                updateNode={previewMode ? () => { } : updateNode}
                setNodes={previewMode ? () => { } : setNodes}
                preview={previewMode}
                deviceSizes={deviceSizes}
            />
        </div>
    )
}

export default ViewMode
