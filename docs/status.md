# Status

## Current
- MediaPipe в auth-staging переведён на first-party загрузку.
- Runtime берётся из `@mediapipe/tasks-vision`.
- `wasm` и `pose_landmarker_full.task` отдаются из `public/mediapipe`.

## Notes
- Цель изменения: убрать зависимость камеры от `cdn.jsdelivr.net` и `storage.googleapis.com`, чтобы Chrome и Safari работали одинаково на deployed staging и в production.
