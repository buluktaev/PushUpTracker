export type ExerciseMode = "reps" | "hold"
export type BodyCheck = "horizontal" | "vertical" | "none"
export type PoseCheck =
  | "pushups"
  | "squats"
  | "crunches"
  | "armVisibility"
  | "lateralRaise"
  | "plank"
export type AngleStrategy = "average" | "bestVisibleSide"

export interface ExerciseConfig {
  slug: string
  name: string
  tabLabel: string
  icon: string
  mode: ExerciseMode
  bodyCheck: BodyCheck
  poseCheck: PoseCheck
  angleStrategy: AngleStrategy
  positionHint: string
  positionHintMobile?: string
  cameraGuidance: string
  cameraGuidanceMobile?: string
  moveToDownHint?: string
  moveToUpHint?: string
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
    icon: "push_up",
    mode: "reps",
    bodyCheck: "horizontal",
    poseCheck: "pushups",
    angleStrategy: "bestVisibleSide",
    positionHint: "займите упор лёжа",
    positionHintMobile: "примите упор лёжа",
    cameraGuidance: "Примите упор лёжа и держите корпус целиком в кадре. Можно стоять лицом к камере или боком к камере.",
    cameraGuidanceMobile: "Упор лёжа. Можно лицом или боком к камере.",
    moveToDownHint: "↓ опуститесь ниже",
    moveToUpHint: "↑ поднимитесь выше",
    keypointsLeft: [11, 13, 15],
    keypointsRight: [12, 14, 16],
    downAngle: 100,
    upAngle: 140,
  },
  {
    slug: "squats",
    name: "Приседания",
    tabLabel: "Присед",
    icon: "squad",
    mode: "reps",
    bodyCheck: "vertical",
    poseCheck: "squats",
    angleStrategy: "bestVisibleSide",
    positionHint: "встаньте в полный рост",
    positionHintMobile: "встаньте прямо",
    cameraGuidance: "Встаньте в полный рост и держите в кадре плечи, таз, колени и стопы.",
    cameraGuidanceMobile: "Встаньте прямо, ноги и корпус должны быть в кадре.",
    moveToDownHint: "↓ присядьте ниже",
    moveToUpHint: "↑ выпрямитесь",
    keypointsLeft: [23, 25, 27],
    keypointsRight: [24, 26, 28],
    downAngle: 110,
    upAngle: 160,
  },
  {
    slug: "crunches",
    name: "Скручивания",
    tabLabel: "Скручивания",
    icon: "crunches",
    mode: "reps",
    bodyCheck: "horizontal",
    poseCheck: "crunches",
    angleStrategy: "bestVisibleSide",
    positionHint: "лягте на спину",
    positionHintMobile: "лягте на спину",
    cameraGuidance: "Лягте на спину и держите корпус с ногами в кадре. Лучше расположиться боком к камере.",
    cameraGuidanceMobile: "Лягте на спину, лучше боком к камере.",
    moveToDownHint: "↑ поднимите корпус",
    moveToUpHint: "↓ опуститесь обратно",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 120,
    upAngle: 145,
  },
  {
    slug: "bicep_curl",
    name: "Сгибание на бицепс",
    tabLabel: "Бицепс",
    icon: "biceps",
    mode: "reps",
    bodyCheck: "vertical",
    poseCheck: "armVisibility",
    angleStrategy: "bestVisibleSide",
    positionHint: "встаньте прямо и покажите руку",
    positionHintMobile: "встаньте прямо",
    cameraGuidance: "Встаньте прямо и держите рабочую руку полностью в кадре. Локоть и кисть не должны выходить за край экрана.",
    cameraGuidanceMobile: "Встаньте прямо и покажите руку целиком.",
    moveToDownHint: "↓ опустите руку",
    moveToUpHint: "↑ согните руку выше",
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
    icon: "pull_up",
    mode: "reps",
    bodyCheck: "vertical",
    poseCheck: "armVisibility",
    angleStrategy: "bestVisibleSide",
    positionHint: "встаньте в полный рост",
    positionHintMobile: "встаньте прямо",
    cameraGuidance: "Держите в кадре плечо, локоть и кисть. Лучше расположиться так, чтобы руки были видны полностью.",
    cameraGuidanceMobile: "Руки должны быть полностью в кадре.",
    moveToDownHint: "↓ опуститесь ниже",
    moveToUpHint: "↑ подтянитесь выше",
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
    icon: "swing",
    mode: "reps",
    bodyCheck: "vertical",
    poseCheck: "lateralRaise",
    angleStrategy: "average",
    positionHint: "встаньте прямо и покажите руки",
    positionHintMobile: "встаньте прямо",
    cameraGuidance: "Встаньте лицом к камере и держите обе руки полностью в кадре от плеча до локтя.",
    cameraGuidanceMobile: "Встаньте лицом к камере и покажите обе руки.",
    moveToDownHint: "↑ поднимите руки выше",
    moveToUpHint: "↓ опустите руки",
    keypointsLeft: [23, 11, 13],
    keypointsRight: [24, 12, 14],
    downAngle: 30,
    upAngle: 80,
  },
  {
    slug: "plank",
    name: "Планка",
    tabLabel: "Планка",
    icon: "plank",
    mode: "hold",
    bodyCheck: "horizontal",
    poseCheck: "plank",
    angleStrategy: "bestVisibleSide",
    positionHint: "займите положение планки",
    positionHintMobile: "примите планку",
    cameraGuidance: "Примите планку и держите корпус в кадре от плеч до стоп. Лучше расположиться боком к камере.",
    cameraGuidanceMobile: "Примите планку, лучше боком к камере.",
    keypointsLeft: [11, 23, 27],
    keypointsRight: [12, 24, 28],
    downAngle: 0,
    upAngle: 0,
  },
]

export const visibleDisciplineSlugs = exerciseConfigs.map(config => config.slug)

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
