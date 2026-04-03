# AGENTS.md — phase2-redesign-sync

Этот файл дополняет корневой `AGENTS.md` проекта и описывает только устойчивые правила для worktree:

- `/Users/buluktaev/Documents/GitHub/PushUpTracker/.worktrees/phase2-redesign-sync`

Если правила ниже конфликтуют с корневым `AGENTS.md`, сначала следуй корневому файлу, затем этому.

## Контекст ветки

- Ветка: `feature/phase2-redesign-sync`
- Этап form/auth/create-join считается закрытым
- Следующий этап работы: экраны комнаты и взаимодействия внутри `/room/[code]`

## Source Of Truth

- Figma — источник визуальной геометрии и состояний
- реальный route/component — каноническая реализация
- `/screens` — основная review surface для экранов
- `/components` — review surface для примитивов и компонентов
- `memory/status.md` — текущий operational snapshot
- `memory/decisions.md` — только долгоживущие решения

## Production-First

- Сначала правится реальный route или shared production component
- Потом обеспечивается parity на `/screens`
- Не делать preview-only реализацию, если экран уже должен жить в продукте

## Screen Workflow

- Единица работы: один экран за раз
- Для каждого экрана закрывать вместе:
  - `light`
  - `dark`
  - `desktop web`
  - `mobile PWA`
- Не переходить к следующему экрану, пока текущий не стабилен визуально и по состояниям

## Form/Auth/Create-Join Contracts

Эти правила уже согласованы и не должны ломаться без явного запроса.

### Геометрия form shell

- desktop/web form block:
  - `w-[400px]`
  - `pt-[200px]`
- mobile/web form block:
  - `w-[calc(100%-32px)]`
  - `pt-[144px]`
  - side paddings по `16px`

### Block spacing

- Внешний ритм между major blocks: `gap-2` (`8px`)
- Major blocks:
  - brand row
  - heading group
  - field group
  - button group
  - signout/footer group

### Heading group

- `h1 + caption/body` = одна внутренняя визуальная группа
- Между `h1` и его caption/body нельзя ставить внешний `gap-2`
- Внутри группы spacing делается через внутренние `pt-2` / `pb-[2px]`, если это требуется Figma

### Loading behavior

- Во время loading должны быть disabled:
  - inputs
  - submit buttons
  - back buttons
  - inline links / text buttons
- На успешном переходе loading не должен сбрасываться в idle до takeover следующего route

### Theme behavior

- pre-auth routes живут только на системной теме:
  - `/login`
  - `/register`
  - `/verify-email`
  - `/auth/confirm`
  - `/welcome`
  - `/register/name`
- Theme init запускается inline в `<head>`, чтобы не было flash light theme на refresh

### Loading screen

- Канонический экран загрузки:
  - `app/loading.tsx`
  - `components/AppLoadingScreen.tsx`
- Не возвращаться к legacy loading UI вида `// загрузка...`
- Никаких искусственных задержек ради показа loading screen

## Post-Auth Entry Flow On `/`

- Ветка после авторизации зависит от количества комнат:
  - `0 rooms` -> empty post-auth entry screen
  - `1 room` -> redirect в комнату
  - `2+ rooms` -> returning rooms screen
  - `?add=1` -> compact add-room chooser

### Action selection mechanic

- На entry screens карточка не должна сразу переводить дальше
- Механика едина:
  - выбрать карточку
  - показать `Продолжить`
  - перейти только по `Продолжить`

### `add_room()` from room

- Если add-room открыт из комнаты, source room должен сохраняться в query:
  - `/?add=1&fromRoom=<code>`

### Back behavior for room-originated add flow

- На первом add-room action screen:
  - `Назад` -> обратно в source room
- На внутренних шагах:
  - back по уровню назад внутри flow
  - не выбрасывать сразу в комнату

## Component Contracts

### `ChoiceCard`

- должен иметь live states:
  - `default`
  - `hovered`
  - `selected`
- `RadioButton` внутри синхронизирован с состоянием карточки
- hover не должен залипать у невыбранной карточки после смены выбора

### `SelectCard`

- тоже имеет live `hovered`
- selected-state контракт отличается от `ChoiceCard`
- не сводить `ChoiceCard` и `SelectCard` к одному generic поведению

### `Input`

- border и высота собраны через `border-box`, без раздувания контрола border-ом
- autofill override применяется только через `:-webkit-autofill`
- обычное выделение текста не отключать через `::selection { background: transparent }`

### Password toggle

- toggle видимости пароля не должен мгновенно менять иконку
- обе иконки должны оставаться в DOM
- переключение через CSS-only:
  - `opacity`
  - `scale`
  - `blur`
- значения:
  - inactive: `scale(0.25)`, `opacity: 0`, `blur(4px)`
  - active: `scale(1)`, `opacity: 1`, `blur(0)`

## Typography And Motion

### Crisp text

- глобально на `body` должны оставаться:
  - `-webkit-font-smoothing: antialiased`
  - `-moz-osx-font-smoothing: grayscale`
  - `text-rendering: optimizeLegibility`

### Text wrap

- глобально:
  - `h1-h4` -> `text-wrap: balance`
  - `p, li, figcaption, blockquote` -> `text-wrap: pretty`

### Form enter motion

- Не анимировать весь form container целиком
- Анимировать semantic sections:
  - brand row
  - heading group
  - field group
  - action group
- Для этого используется shared wrapper:
  - `components/RevealSection.tsx`

## Dev / Infra Notes

- Один worktree = один live `next dev`
- Для этого worktree dev поднимать из самого worktree, не в смешанном env режиме
- Не запускать `npm run build` параллельно с `next dev` в той же worktree
- Если dev ломается chunk-ошибками:
  - остановить `next`
  - удалить `.next`
  - поднять dev заново

## Production DB Backup Contract

- Перед production rollout backup БД обязателен, если пользователь явно не принял риск выката без backup.
- Для этого проекта канонический terminal-path backup:
  - `pg_dump`
  - host: `rc1a-7633vqts157enmle.mdb.yandexcloud.net`
  - port: `6432`
  - database: `selectywellness_app`
  - user: `selectywellness_app`
  - `sslmode=require`
- Если этот connection contract не менялся, агент должен просить у пользователя только пароль БД.
- Не уводить пользователя по умолчанию в `yc`, cloud console, CA download или certificate-debugging, если рабочий `pg_dump` backup можно сделать сразу.
- После создания dump агент обязан проверить backup через:
  - наличие `.dump` файла
  - `pg_restore --list`
  - подтверждение, что archive metadata указывает на `selectywellness_app`

## Logout Contract

- logout из комнаты идет через server route:
  - `POST /api/auth/logout`
- финальный переход после logout:
  - hard navigation на `/login`
- не возвращаться к client-only logout

## Memory Discipline

- После значимой сессии обновлять:
  - `memory/status.md`
  - `memory/sessions/YYYY-MM-DD.md`
- `memory/decisions.md` пополнять только действительно долговечными правилами
