import { RedoIcon, UndoIcon } from "../../assets/icons";

interface HeaderProps {
    undo: () => void;
    canUndo: boolean
    canRedo: boolean;
    redo: () => void;
    setPreviewMode: (val: boolean) => void;
    previewMode: boolean;
    handlePublish: () => void;
}

const Header = ({ canRedo, canUndo, handlePublish, previewMode, redo, setPreviewMode, undo, }: HeaderProps) => {
    return (
        <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200">
            <div className="flex gap-3 items-center">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`border border-gray-300 rounded-lg p-1 transition
                    ${canUndo ? "hover:bg-gray-100 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"}
                    `}
                >
                    <UndoIcon height={30} width={25} />
                </button>

                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`border border-gray-300 rounded-lg p-1 transition
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
    )
}

export default Header
