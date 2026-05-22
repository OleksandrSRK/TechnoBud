import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type Props = {
    open: boolean
    onClose: () => void
    children: ReactNode
}

export default function AdminModal({ open, onClose, children }: Props) {
    const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setMouseDownTarget(e.target)
    }, [])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (
            mouseDownTarget === e.currentTarget &&
            e.target === e.currentTarget
        ) {
            onClose()
        }
        setMouseDownTarget(null)
    }, [mouseDownTarget, onClose])

    if (!open) return null

    return (
        <div
            className="admin-modal-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div
                className="admin-modal"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}