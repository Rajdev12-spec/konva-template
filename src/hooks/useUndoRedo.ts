import { useState } from "react"

export function useUndoRedo<T>(initialPresent: T) {
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initialPresent)
  const [future, setFuture] = useState<T[]>([])

  const set = (action: React.SetStateAction<T>) => {
    setPast(prev => [...prev, present])

    setPresent(prevPresent =>
      typeof action === "function"
        ? (action as (prev: T) => T)(prevPresent)
        : action
    )

    setFuture([])
  }

  const undo = () => {
    if (!past.length) return

    const previous = past[past.length - 1]
    setPast(past.slice(0, -1))
    setFuture(f => [present, ...f])
    setPresent(previous)
  }

  const redo = () => {
    if (!future.length) return

    const next = future[0]
    setFuture(future.slice(1))
    setPast(p => [...p, present])
    setPresent(next)
  }

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  }
}
