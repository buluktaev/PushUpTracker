# Test Plan

## MediaPipe Smoke
- Открыть staging в Chrome.
- Включить камеру в `Workout`.
- Убедиться, что статус не падает в `err: local mediapipe failed`.
- В `Network` убедиться, что MediaPipe грузится только с:
  - `/mediapipe/wasm/...`
  - `/mediapipe/models/pose_landmarker_full.task`
- Убедиться, что нет запросов к `cdn.jsdelivr.net` и `storage.googleapis.com`.

## Regression
- Повторить тот же сценарий в Safari.
- Проверить, что старт/стоп камеры работает.
- Проверить, что сохранение тренировки после успешного запуска камеры не ломается.
