import { DesktopIcon, MobileIcon, RedoIcon, TabletIcon, UndoIcon } from "../../assets/icons";
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

    const devices: { type: DeviceType, icon: any, label: string }[] = [
        { type: "mobile", icon: MobileIcon, label: "Mobile" },
        { type: "tablet", icon: TabletIcon, label: "Tablet" },
        { type: "desktop", icon: DesktopIcon, label: "Desktop" },
    ]

    return (
        <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-6">
                {!previewMode && (
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
                )}
            </div>

            {/* Device Selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                {devices.map((d) => (
                    <button
                        key={d.type}
                        onClick={() => setDevice(d.type)}
                        title={d.label}
                        className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${device === d.type
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                            }`}
                    >
                        <d.icon height={20} width={20} />
                    </button>
                ))}
            </div>


            <div className="flex gap-2 items-center">
                {!previewMode ? (
                    <button
                        onClick={() => setPreviewMode(true)}
                        className="cursor-pointer px-4 py-2 rounded-lg border hover:bg-gray-100 font-medium text-gray-700 transition"
                    >
                        Preview
                    </button>
                ) : (
                    <button
                        onClick={() => handleClosePreview()}
                        className="cursor-pointer px-4 py-2 rounded-lg border hover:bg-gray-100 font-medium text-gray-700 transition"
                    >
                        Exit Preview
                    </button>
                )}

                <button
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md"
                    onClick={handlePublish}
                >
                    Publish
                </button>
            </div>
        </div>
    )
}

export default Header
