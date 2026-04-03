import { getExerciseTabMeta } from '@/lib/exerciseConfigs'

export type RoomTabKey = 'workout' | 'leaderboard' | 'settings' | 'profile'

export interface RoomTabItem {
  key: RoomTabKey
  label: string
  icon: string
}

export function getRoomTabs(discipline: string | undefined, isOwner: boolean): RoomTabItem[] {
  const workoutTab = getExerciseTabMeta(discipline)

  const tabs: RoomTabItem[] = [
    { key: 'workout', label: workoutTab.tabLabel, icon: workoutTab.icon },
    { key: 'leaderboard', label: 'рейтинг', icon: 'emoji_events' },
  ]

  if (isOwner) {
    tabs.push({ key: 'profile', label: 'профиль', icon: 'person' })
    tabs.push({ key: 'settings', label: 'настройки', icon: 'settings' })
    return tabs
  }

  tabs.push({ key: 'profile', label: 'профиль', icon: 'person' })

  return tabs
}
