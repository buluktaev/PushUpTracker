export const mockRooms = [
  { roomCode: 'ABC123', participantId: 'p1', name: 'Алексей', roomName: 'Команда Альфа' },
  { roomCode: 'DEF456', participantId: 'p2', name: 'Алексей', roomName: 'Утренняя зарядка' },
  { roomCode: 'GHI789', participantId: 'p3', name: 'Алексей', roomName: 'Марафон марта' },
]

export const mockLeaderboard = [
  { id: 'p1', name: 'Алексей', totalValue: 450, sessionsCount: 12, bestSession: 52, activeToday: true },
  { id: 'p2', name: 'Мария', totalValue: 380, sessionsCount: 10, bestSession: 48, activeToday: true },
  { id: 'p3', name: 'Дмитрий', totalValue: 290, sessionsCount: 8, bestSession: 40, activeToday: false },
  { id: 'p4', name: 'Елена', totalValue: 210, sessionsCount: 6, bestSession: 35, activeToday: false },
  { id: 'p5', name: 'Иван', totalValue: 150, sessionsCount: 4, bestSession: 30, activeToday: false },
]

export const mockRoom = {
  name: 'Команда Альфа',
  code: 'ABC123',
  discipline: 'pushups',
  isOwner: true,
  leaderboard: mockLeaderboard,
  stats: { totalValue: 1480, participantsCount: 5, sessionsCount: 40, activeToday: 2 },
}

export const mockRoomMember = {
  ...mockRoom,
  isOwner: false,
}

export const mockProfile = { email: 'alexey@example.com', name: 'Алексей' }
