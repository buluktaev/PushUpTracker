export type ExerciseMode = "reps" | "hold"
export type BodyCheck = "horizontal" | "vertical" | "none"

export interface ExerciseConfig {
  slug: string
  name: string
  tabLabel: string
  icon: string
  mode: ExerciseMode
  bodyCheck: BodyCheck
  keypointsLeft: [number, number, number]
  keypointsRight: [number, number, number]
  downAngle: number
  upAngle: number
  isInverted?: boolean
}

// TODO: иконки — placeholder Material Symbols, будут заменены на кастомные иллюстрации
export const exerciseConfigs: ExerciseConfig[] = [
  {
    slug: "pushups",
    name: "Отжимания",
    tabLabel: "Отжимания",
    icon: "fitness_center",
    mode: "reps",
    bodyCheck: "horizontal",
    keypointsLeft: [11, 13, 15],
    keypointsRight: [12, 14, 16],
    downAngle: 100,
    upAngle: 140,
  },
  {
    slug: "squats",
    name: "Приседания",
    tabLabel: "Присед",
    icon: "sports_martial_arts",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [23, 25, 27],
    keypointsRight: [24, 26, 28],
    downAngle: 110,
    upAngle: 160,
  },
  {
    slug: "situps",
    name: "Подъём корпуса",
    tabLabel: "Корпус",
    icon: "airline_seat_flat",
    mode: "reps",
    bodyCheck: "horizontal",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 145,
    upAngle: 160,
  },
  {
    slug: "crunches",
    name: "Скручивания",
    tabLabel: "Скручивания",
    icon: "airline_seat_flat",
    mode: "reps",
    bodyCheck: "horizontal",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 120,
    upAngle: 145,
  },
  {
    slug: "bicep_curl",
    name: "Сгибание на бицепс",
    tabLabel: "Бицепс",
    icon: "exercise",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [11, 13, 15],
    keypointsRight: [12, 14, 16],
    downAngle: 160,
    upAngle: 60,
    isInverted: true,
  },
  {
    slug: "pullups",
    name: "Подтягивания",
    tabLabel: "Подтягивания",
    icon: "iron",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [11, 13, 15],
    keypointsRight: [12, 14, 16],
    downAngle: 140,
    upAngle: 70,
    isInverted: true,
  },
  {
    slug: "lateral_raise",
    name: "Махи в стороны",
    tabLabel: "Махи",
    icon: "pan_tool_alt",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [23, 11, 13],
    keypointsRight: [24, 12, 14],
    downAngle: 30,
    upAngle: 80,
  },
  {
    slug: "overhead_press",
    name: "Жим над головой",
    tabLabel: "Жим",
    icon: "keyboard_double_arrow_up",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [23, 11, 13],
    keypointsRight: [24, 12, 14],
    downAngle: 100,
    upAngle: 150,
  },
  {
    slug: "leg_raise",
    name: "Подъём ног",
    tabLabel: "Ноги",
    icon: "directions_walk",
    mode: "reps",
    bodyCheck: "horizontal",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 130,
    upAngle: 160,
  },
  {
    slug: "knee_raise",
    name: "Подъём колен",
    tabLabel: "Колени",
    icon: "directions_run",
    mode: "reps",
    bodyCheck: "vertical",
    keypointsLeft: [23, 25, 27],
    keypointsRight: [24, 26, 28],
    downAngle: 110,
    upAngle: 160,
  },
  {
    slug: "plank",
    name: "Планка",
    tabLabel: "Планка",
    icon: "horizontal_rule",
    mode: "hold",
    bodyCheck: "horizontal",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 0,
    upAngle: 0,
  },
]

export function getExerciseConfig(slug: string): ExerciseConfig | undefined {
  return exerciseConfigs.find(c => c.slug === slug)
}

export function getExerciseTabMeta(slug: string | undefined): Pick<ExerciseConfig, "tabLabel" | "icon"> {
  const config = slug ? getExerciseConfig(slug) : undefined
  return {
    tabLabel: config?.tabLabel ?? "Тренировка",
    icon: config?.icon ?? "fitness_center",
  }
}

export function isValidDiscipline(slug: string): boolean {
  return exerciseConfigs.some(c => c.slug === slug)
}

export function formatValue(value: number, mode: ExerciseMode): string {
  if (mode === "hold") {
    const min = Math.floor(value / 60)
    const sec = value % 60
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }
  return value.toString()
}
