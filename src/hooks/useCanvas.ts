import { useState, useCallback, useRef, useEffect } from 'react'
import type { Room } from '@/types'

const SCALE = 8
const HANDLE_SIZE = 10
const MIN_SIZE = 5 // minimum room size in plot units

type Corner = 'NW' | 'NE' | 'SW' | 'SE'

interface DragState {
  type: 'move' | 'resize'
  roomId: string
  startMouseX: number
  startMouseY: number
  startRoomX: number
  startRoomY: number
  startWidth: number
  startHeight: number
  corner?: Corner
}

export function useCanvas(
  rooms: Room[],
  onRoomsChange?: (rooms: Room[]) => void,
  onUndo?: () => void,
  plotWidth?: number,
  plotHeight?: number,
) {
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const localRoomsRef = useRef<Room[]>(rooms)
  const selectedRoomIdRef = useRef<string | null>(null)

  // Keep refs in sync
  useEffect(() => {
    localRoomsRef.current = localRooms
  }, [localRooms])

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId
  }, [selectedRoomId])

  // Keyboard controls: arrow keys (move), Delete/Backspace (remove), Ctrl+Z (undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const roomId = selectedRoomIdRef.current
      if (!roomId) return

      // Ctrl+Z → undo
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onUndo?.()
        return
      }

      // Delete / Backspace → remove selected room
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        const updated = localRoomsRef.current.filter(r => r.id !== roomId)
        setLocalRooms(updated)
        localRoomsRef.current = updated
        setSelectedRoomId(null)
        selectedRoomIdRef.current = null
        onRoomsChange?.(updated)
        return
      }

      // Arrow keys → move by 1 unit
      const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (!ARROWS.includes(e.key)) return
      e.preventDefault()

      const pw = plotWidth ?? Infinity
      const ph = plotHeight ?? Infinity

      setLocalRooms(prev => {
        const updated = prev.map(room => {
          if (room.id !== roomId) return room
          let { x, y } = room
          if (e.key === 'ArrowLeft')  x = Math.max(0, x - 1)
          if (e.key === 'ArrowRight') x = Math.min(pw - room.width, x + 1)
          if (e.key === 'ArrowUp')    y = Math.max(0, y - 1)
          if (e.key === 'ArrowDown')  y = Math.min(ph - room.height, y + 1)
          return { ...room, x, y }
        })
        localRoomsRef.current = updated
        onRoomsChange?.(updated)
        return updated
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRoomsChange, onUndo, plotWidth, plotHeight])

  // Sync external rooms into local state
  const syncRooms = useCallback((newRooms: Room[]) => {
    setLocalRooms(newRooms)
  }, [])

  const getCanvasPos = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const hitTestHandle = (room: Room, mouseX: number, mouseY: number): Corner | null => {
    const rx = room.x * SCALE
    const ry = room.y * SCALE
    const rw = room.width * SCALE
    const rh = room.height * SCALE
    const h = HANDLE_SIZE

    const corners: [Corner, number, number][] = [
      ['NW', rx, ry],
      ['NE', rx + rw, ry],
      ['SW', rx, ry + rh],
      ['SE', rx + rw, ry + rh],
    ]

    for (const [corner, cx, cy] of corners) {
      if (Math.abs(mouseX - cx) <= h / 2 && Math.abs(mouseY - cy) <= h / 2) {
        return corner
      }
    }
    return null
  }

  const hitTestRoom = (room: Room, mouseX: number, mouseY: number): boolean => {
    const rx = room.x * SCALE
    const ry = room.y * SCALE
    const rw = room.width * SCALE
    const rh = room.height * SCALE
    return mouseX >= rx && mouseX <= rx + rw && mouseY >= ry && mouseY <= ry + rh
  }

  const onMouseDown = useCallback((e: MouseEvent, canvas: HTMLCanvasElement, visibleRooms: Room[]) => {
    const { x: mouseX, y: mouseY } = getCanvasPos(e, canvas)

    // Check handles first (for selected room)
    if (selectedRoomId) {
      const selectedRoom = visibleRooms.find(r => r.id === selectedRoomId)
      if (selectedRoom) {
        const corner = hitTestHandle(selectedRoom, mouseX, mouseY)
        if (corner) {
          dragRef.current = {
            type: 'resize',
            roomId: selectedRoomId,
            startMouseX: mouseX,
            startMouseY: mouseY,
            startRoomX: selectedRoom.x,
            startRoomY: selectedRoom.y,
            startWidth: selectedRoom.width,
            startHeight: selectedRoom.height,
            corner,
          }
          return
        }
      }
    }

    // Check room bodies (reverse order for top-most)
    for (let i = visibleRooms.length - 1; i >= 0; i--) {
      const room = visibleRooms[i]
      if (hitTestRoom(room, mouseX, mouseY)) {
        setSelectedRoomId(room.id)
        dragRef.current = {
          type: 'move',
          roomId: room.id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startRoomX: room.x,
          startRoomY: room.y,
          startWidth: room.width,
          startHeight: room.height,
        }
        return
      }
    }

    // Click empty area — deselect
    setSelectedRoomId(null)
  }, [selectedRoomId])

  const onMouseMove = useCallback((e: MouseEvent, canvas: HTMLCanvasElement, pw: number, ph: number) => {
    if (!dragRef.current) return
    const { x: mouseX, y: mouseY } = getCanvasPos(e, canvas)
    const drag = dragRef.current
    const dx = (mouseX - drag.startMouseX) / SCALE
    const dy = (mouseY - drag.startMouseY) / SCALE

    setLocalRooms(prev => prev.map(room => {
      if (room.id !== drag.roomId) return room

      if (drag.type === 'move') {
        const newX = Math.max(0, Math.min(pw - room.width, drag.startRoomX + dx))
        const newY = Math.max(0, Math.min(ph - room.height, drag.startRoomY + dy))
        return { ...room, x: Math.round(newX * 2) / 2, y: Math.round(newY * 2) / 2 }
      }

      if (drag.type === 'resize') {
        let newX = drag.startRoomX
        let newY = drag.startRoomY
        let newW = drag.startWidth
        let newH = drag.startHeight

        switch (drag.corner) {
          case 'SE': newW = Math.max(MIN_SIZE, drag.startWidth + dx); newH = Math.max(MIN_SIZE, drag.startHeight + dy); break
          case 'SW': newX = Math.min(drag.startRoomX + drag.startWidth - MIN_SIZE, drag.startRoomX + dx); newW = Math.max(MIN_SIZE, drag.startWidth - dx); newH = Math.max(MIN_SIZE, drag.startHeight + dy); break
          case 'NE': newW = Math.max(MIN_SIZE, drag.startWidth + dx); newY = Math.min(drag.startRoomY + drag.startHeight - MIN_SIZE, drag.startRoomY + dy); newH = Math.max(MIN_SIZE, drag.startHeight - dy); break
          case 'NW': newX = Math.min(drag.startRoomX + drag.startWidth - MIN_SIZE, drag.startRoomX + dx); newY = Math.min(drag.startRoomY + drag.startHeight - MIN_SIZE, drag.startRoomY + dy); newW = Math.max(MIN_SIZE, drag.startWidth - dx); newH = Math.max(MIN_SIZE, drag.startHeight - dy); break
        }

        newX = Math.max(0, newX)
        newY = Math.max(0, newY)
        newW = Math.min(newW, pw - newX)
        newH = Math.min(newH, ph - newY)

        return {
          ...room,
          x: Math.round(newX * 2) / 2,
          y: Math.round(newY * 2) / 2,
          width: Math.round(newW * 2) / 2,
          height: Math.round(newH * 2) / 2,
        }
      }

      return room
    }))
  }, [])

  const onMouseUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null
      // Notify parent with final positions using ref to avoid stale closure
      onRoomsChange?.(localRoomsRef.current)
    }
  }, [onRoomsChange])

  return { localRooms, syncRooms, selectedRoomId, onMouseDown, onMouseMove, onMouseUp }
}
