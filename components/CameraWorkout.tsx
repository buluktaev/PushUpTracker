'use client'

interface CameraWorkoutProps {
  participantId: string
  onSessionSaved: () => void
}

export default function CameraWorkout({ participantId, onSessionSaved }: CameraWorkoutProps) {
  return (
    <div className="text-center py-8 text-[#666]">
      Компонент тренировки будет добавлен позже (Task 9).
    </div>
  )
}
