import { RedoIcon, UndoIcon } from "../../assets/icons";
import type { DeviceType } from "../../types/editor";

interface HeaderProps {
    undo: () => void;
    canUndo: boolean
    canRedo: boolean;
    redo: () => void;
    setPreviewMode: (val: boolean) => void;
    previewMode: boolean;
    device: DeviceType;
    setDevice: (val: DeviceType) => void;
    handlePublish: () => void;
    handleClosePreview: () => void;
}

const Header = ({ canRedo, canUndo, handlePublish, previewMode, redo, setPreviewMode, undo, device, setDevice, handleClosePreview }: HeaderProps) => {
    return (
        <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200">
            {!previewMode &&
                <div className="flex gap-3 items-center">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={`border border-gray-300 rounded-lg p-1 transition
              ${canUndo ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                    >
                        <UndoIcon height={30} width={25} />
                    </button>

                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className={`border border-gray-300 rounded-lg p-1 transition
              ${canRedo ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                    >
                        <RedoIcon height={30} width={25} />
                    </button>
                </div>
            }

            <div className={`flex gap-2 ${previewMode && "justify-end w-full"}`}>
                {/* Device Selector */}
                {previewMode && (
                    <select
                        value={device}
                        onChange={e => setDevice(e.target.value as DeviceType)}
                        className="border px-2 py-1 rounded-lg"
                    >
                        <option value="mobile">Mobile (375x667)</option>
                        <option value="tablet">Tablet (768x1024)</option>
                        <option value="desktop">Desktop (1200x800)</option>
                    </select>
                )}

                {!previewMode ? (
                    <button
                        onClick={() => setPreviewMode(true)}
                        className="cursor-pointer px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        Preview
                    </button>
                ) : (
                    <button
                        onClick={() => handleClosePreview()}
                        className="cursor-pointer px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        Exit Preview
                    </button>
                )}

                <button
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    onClick={handlePublish}
                >
                    Publish
                </button>
            </div>
        </div>
    )
}

export default Header
