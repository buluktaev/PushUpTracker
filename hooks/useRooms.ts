'use client'

import { useEffect, useState } from 'react'

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

export function useRooms() {
  const [rooms, setRooms] = useState<SavedRoom[]>([])

  useEffect(() => {
    setRooms(load())
  }, [])

  function addRoom(room: SavedRoom) {
    setRooms(prev => {
      // Replace if same roomCode already exists
      const filtered = prev.filter(r => r.roomCode !== room.roomCode)
      const next = [...filtered, room]
      save(next)
      return next
    })
  }

  function removeRoom(code: string) {
    setRooms(prev => {
      const next = prev.filter(r => r.roomCode !== code)
      save(next)
      return next
    })
  }

  function getRoom(code: string): SavedRoom | null {
    return rooms.find(r => r.roomCode === code) ?? null
  }

  function nextRoom(currentCode: string): SavedRoom | null {
    return rooms.find(r => r.roomCode !== currentCode) ?? null
  }

  return { rooms, addRoom, removeRoom, getRoom, nextRoom }
}
