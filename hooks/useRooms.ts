'use client'

import { useCallback, useEffect, useState } from 'react'

export interface SavedRoom {
  roomCode: string
  participantId: string
  name: string      // имя пользователя в этой комнате
  roomName: string  // название комнаты для отображения
}

const KEY = 'pushup_rooms'

function migrate(): SavedRoom[] {
  if (typeof window === 'undefined') return []
  // Migrate old single-room format
  const old = localStorage.getItem('pushup_identity')
  if (old) {
    try {
      const parsed = JSON.parse(old)
      if (parsed.roomCode && parsed.participantId && parsed.name) {
        const rooms: SavedRoom[] = [{
          roomCode: parsed.roomCode,
          participantId: parsed.participantId,
          name: parsed.name,
          roomName: parsed.roomCode, // fallback — no name stored in old format
        }]
        localStorage.setItem(KEY, JSON.stringify(rooms))
        localStorage.removeItem('pushup_identity')
        return rooms
      }
    } catch {}
    localStorage.removeItem('pushup_identity')
  }
  return []
}

function load(): SavedRoom[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as SavedRoom[]
    } catch {}
  }
  return migrate()
}

function save(rooms: SavedRoom[]) {
  localStorage.setItem(KEY, JSON.stringify(rooms))
}

function mergeRooms(localRooms: SavedRoom[], serverRooms: SavedRoom[]) {
  const merged = new Map<string, SavedRoom>()

  for (const room of localRooms) {
    merged.set(room.roomCode, room)
  }

  for (const room of serverRooms) {
    const existing = merged.get(room.roomCode)
    merged.set(room.roomCode, existing ? { ...existing, ...room } : room)
  }

  return Array.from(merged.values())
}

function isSavedRoom(room: unknown): room is SavedRoom {
  if (typeof room !== 'object' || room === null) return false

  const candidate = room as Record<string, unknown>
  return (
    typeof candidate.roomCode === 'string' &&
    typeof candidate.participantId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.roomName === 'string'
  )
}

export function useRooms() {
  const [rooms, setRooms] = useState<SavedRoom[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const localRooms = load()
    setRooms(localRooms)
    setLoaded(true)

    let cancelled = false

    async function hydrateFromServer() {
      try {
        const res = await fetch('/api/rooms')
        if (!res.ok) return

        const data = await res.json()
        if (!Array.isArray(data.rooms)) return

        const serverRooms = data.rooms.filter(isSavedRoom)

        if (cancelled) return

        setRooms(prev => {
          const next = mergeRooms(prev, serverRooms)
          save(next)
          return next
        })
      } catch {}
    }

    void hydrateFromServer()

    return () => {
      cancelled = true
    }
  }, [])

  const addRoom = useCallback((room: SavedRoom) => {
    setRooms(prev => {
      // Replace if same roomCode already exists
      const filtered = prev.filter(r => r.roomCode !== room.roomCode)
      const next = [...filtered, room]
      save(next)
      return next
    })
  }, [])

  const removeRoom = useCallback((code: string) => {
    setRooms(prev => {
      const next = prev.filter(r => r.roomCode !== code)
      save(next)
      return next
    })
  }, [])

  const clearRooms = useCallback(() => {
    setRooms([])
    save([])
  }, [])

  const getRoom = useCallback((code: string): SavedRoom | null => {
    return rooms.find(r => r.roomCode === code) ?? null
  }, [rooms])

  const nextRoom = useCallback((currentCode: string): SavedRoom | null => {
    return rooms.find(r => r.roomCode !== currentCode) ?? null
  }, [rooms])

  return { rooms, loaded, addRoom, removeRoom, clearRooms, getRoom, nextRoom }
}
