# Модуль «Языки» — дорожная карта

Модуль для изучения языков: пользователь создаёт язык, внутри него ведёт словарь, конспекты, повторяет слова и отслеживает прогресс.

Ветка: `languages`. Порядок работы: этап → ревью → коммит → следующий этап.

Не берём: Telegram-бот, импорт/экспорт CSV/Anki, автоперевод через внешний API.

---

## Этап 0. Рефакторинг доступа к модулям

- [x] `require_module(name)` в `dependencies/auth.py` вместо трёх копий `get_finances` / `get_trainings` / `get_achievements`
- [x] Старые имена сохранены, роутеры не меняются

**Готово, когда:** финансы, тренировки и Steam работают как раньше; пользователь без модуля получает 403.

## Этап 1. Бэкенд: языки, слова, конспекты

**1.1 Модели** (`db/models/languages/`, по образцу `db/models/trainings/`)
- [x] `Language`: `name`, `code` (`en-US`, `es-ES` — для озвучки), `current_level` / `target_level` (enum A1–C2, обязательные), `user_id`; `UniqueConstraint("name", "user_id")`
- [x] `Word`: `word`, `translation`, `transcription?`, `part_of_speech?` (enum), `example?`, `note?`, `created_at`, `language_id`, `user_id`; поля SRS `box` (int, default 0), `next_review_date`; `UniqueConstraint("word", "language_id")`
- [x] `LanguageNote`: `title`, `content` (`Text`), `created_at`, `updated_at`, `language_id`, `user_id`
- [x] Связи у `Language` с `cascade="all, delete-orphan"`; `back_populates` в `User` (`db/models/common/user.py`, импорт в блок `TYPE_CHECKING`)
- [x] Enum'ы по образцу `MuscleGroup` (`native_enum=False`, `values_callable`)
- [x] Новые модели добавлены в `db/models/__init__.py`, иначе Alembic их не увидит

**1.2 Миграция**
- [x] `alembic revision --autogenerate -m "add languages module"` — прочитать сгенерированный файл (enum, `server_default`)
- [x] `alembic upgrade head`

**1.3 Доступ**
- [x] В админке: `Modules(name="languages")` + связь в `ModulesUsers`
- [x] `get_languages` через `require_module("languages")`

**1.4 Схемы** (`schemas/languages/`)
- [x] Create / Change / Read для языка, слова, конспекта
- [x] `box` и `next_review_date` — только в Read
- [x] `LanguageRead` без вложенного списка слов

**1.5 Роутеры** (`routers/languages/`)
- [x] `/languages/` — CRUD языков (без пагинации)
- [x] `/languages/{language_id}/words/` — CRUD слов; список `Page[...]` + поиск `word` / `translation` (`ilike`)
- [x] `/languages/{language_id}/notes/` — CRUD конспектов
- [x] Хелпер `check_availability(...)` (`utils/check_availability.py`) → объект или 404; вызывается в каждом эндпоинте слов/конспектов
- [x] Регистрация в `main.py`

**Готово, когда:** в `/docs` работает весь сценарий; чужой `language_id` → 404; удаление языка удаляет его слова и конспекты.

## Этап 2. Фронтенд: база

- [x] `'/languages'` в `proxy` в `frontend/vite.config.js` — иначе запросы с фронта не дойдут до бэка
- [x] `types/languages/*.ts`, `api/languages/*.ts` по образцу `api/trainings/trainings.ts`
- [x] Роуты `/learn` и `/learn/:languageId` через `ModuleRoute module="languages"` (не `/languages`: этот префикс проксируется на бэк); заглушки `LanguagesPage` и `LanguageDetailPage`
- [x] Новый цвет неона (`NeonBackground` + `AppContent`), карточка на `StartPage` — голубой `#22d3ee`, вариант `cyan`
- [x] Страница `/learn` (`LanguagesPage`): список языков, создание языка (название, код, уровни), переход на `/learn/:id`
- [x] Страница языка (`LanguageDetailPage`): название в шапке, вкладки «Словарь» / «Конспекты»
- [x] Вкладка «Словарь»: поиск (по слову или переводу, задержка 300 мс), пагинация (новые слова первыми), модалка создания/редактирования, удаление
- [x] Вкладка «Конспекты»: карточки с превью, просмотр, создание/правка (`textarea`, `white-space: pre-wrap`, защита от потери текста, Ctrl+Enter), удаление; новые первыми
- [x] (опц.) Правка и удаление языка: ✎ в шапке страницы языка (название, код для озвучки, уровни), «Удалить язык»

**Готово, когда:** весь сценарий этапа 1 проходится из UI.

## Этап 3. Теги для слов

- [x] Модель `WordTag` (таблица `word_tags`) + модель-связь `WordTagLinks` (`word_tag_links`, `ondelete=CASCADE`), всё в `db/models/languages/word.py`
- [x] `Word.tags` с `lazy="selectin"` (иначе `MissingGreenlet` в async), `secondary="word_tag_links"`
- [x] CRUD тегов (`routers/languages/tags.py`, имя нормализуется: «  ЕДА » → «Еда»); `tag_ids` в Create/Change слова, `tags` в `WordRead`; фильтр `?tag_id=`; проверка, что теги из того же языка (`utils/language_tags.py`)
- [x] Фронт: теги на строке слова, выбор и быстрое создание тегов в форме слова, фильтр по тегу в словаре
- [x] (опц.) Управление тегами в UI: переименование и удаление (API уже есть)

## Этап 4. Интервальное повторение (коробки Лейтнера)

- [x] Чистая функция `next_review(box, remembered, today)` в `utils/next_review.py`; интервалы 1 / 3 / 7 / 14 / 30 дней; «не помню» → коробка 1, завтра
- [x] Статус из коробки: 0 — новое, 1–4 — изучаю, 5 — выучено (`wordStatus` в `utils/languages.ts`, показывается на карточке)
- [x] Таблица `word_reviews` (`WordReview`): слово (`SET NULL`), язык (`CASCADE`), ответ, коробка после ответа, время — лог для статистики
- [x] `GET /languages/{id}/review/?limit=20` — слова на сегодня: сначала просроченные, потом новые; `total` — всего на сегодня
- [x] `POST /languages/{id}/words/{word_id}/review/` с `{remembered}`; повторный ответ до срока → 409
- [x] Фронт: вкладка «Повторение» — карточка, «Помню / Не помню», счётчик, клавиши (пробел, 1/←, 2/→), итог порции, «Ещё N слов»
- [x] (опц.) Статус слова бейджем в словаре (Новое / Изучаю / Выучено, в подсказке дата следующего повторения)
- [x] (опц.) Повтор забытых слов в конце порции (без отправки второго ответа)
- [x] (опц.) Повторение по тегу (`tag_id` в `/review/`)
- [ ] (отложено) pytest-тесты для `next_review`

## Этап 5. Озвучка

- [x] `speechSynthesis` + голос по `language.code` (хук `hooks/useSpeech.js`, `es-ES` → точный голос, иначе любой `es-*`)
- [x] Кнопка 🔊 (`SpeakButton`) в словаре и на карточке повторения (слово и пример), клавиша S/Ы; подсказки кодов в форме языка
- [x] Учесть `voiceschanged` в Chrome; скрывать кнопку, если голоса для языка нет; `cancel()` перед каждым `speak`

### 🏁 MVP (этапы 0–5)

- [x] Мерж `languages` → `main`
- [x] Обновить README

---

## Техдолг: проверка владения связанными сущностями (после MVP)

Сейчас незаметно, потому что пользователь в БД один; со вторым пользователем это станет реальной дырой.

- [x] `create_transaction` и `change_transaction` (`routers/finances/transactions.py`): `category_id` и `account_id` из тела запроса принадлежат текущему пользователю, иначе 404 — сейчас можно создать транзакцию на чужой счёт/категорию
- [x] `create_ex_training` (`routers/trainings/training_exercises.py`): `training_id` и `exercise_id` принадлежат текущему пользователю — сейчас можно добавить упражнение в чужую тренировку
- [x] Change-схемы во всех модулях: явный `null` в обязательном поле (`{"name": null}`) даёт 500 от БД вместо 422 — добавить `check_not_null = forbid_null(...)` из `schemas/common/common.py`, как в языках
- [x] Дубли по `UniqueConstraint` (категории, счета, упражнения, тренировки) дают 500 — заменить `session.commit()` на `commit_or_conflict` из `utils/commit.py`
- [x] Проверить всё со вторым тестовым пользователем (автотест API на двух пользователях)
- [x] Регистрация не отдаёт `hashed_password`, занятый ник → 400; `GET /users/` и `/users/{id}` только для админа (раньше любой видел почты всех)
- [x] Удаление категории/счёта с транзакциями и упражнения из тренировок → 409 вместо 500
- [x] Тренировки: уникальность `(name, date, user_id)` вместо `(name, user_id)` — можно повторять «Ноги» в разные дни; `PATCH` тренировки с датой больше не даёт 422
- [x] Фронт финансов и тренировок показывает ошибки бэка в модалках; `PATCH` счёта/категории/транзакции с завершающим `/` (без него редирект и правка не сохранялась)

---

## Этап 6. Журнал занятий

- [x] Модель `StudySession`: дата, минуты, тип (чтение, аудирование, говорение, письмо, грамматика, слова), комментарий
- [x] CRUD + выборка за период
- [ ] Фронт: вкладка «Журнал»

## Этап 7. Статистика

- [ ] `GET /languages/{id}/stats`: слова добавлено/выучено по неделям, точность ответов, минуты по типам, streak
- [ ] (опц.) Кэш в Redis как в финансах, с инвалидацией
- [ ] Фронт: `StatTile`, графики из тренировок

## Этап 8. Режимы тренировки

- [ ] Обратный перевод
- [ ] Ввод с клавиатуры (сравнение без учёта регистра и пробелов)
- [ ] Выбор из 4 вариантов
- [ ] Все режимы пишут в тот же `POST .../review`

## Этап 9. Markdown и фото → Markdown

**9.1 Markdown**
- [ ] Рендер через `react-markdown` + `remark-gfm` (хранение не меняется, миграция не нужна)
- [ ] Переключатель «Редактировать / Просмотр»

**9.2 Фото → Markdown через Claude API**
- [ ] `POST /languages/{id}/notes/from-image`: `UploadFile`, проверка типа и размера, base64 → блок `image` + инструкция
- [ ] SDK `anthropic`, клиент `AsyncAnthropic`; ключ в `.env` / `settings`
- [ ] Модель `claude-opus-5-5`, `effort: "low"`
- [ ] Возвращать черновик, не сохранять сразу — пользователь правит и сохраняет сам
- [ ] Обработка `stop_reason == "refusal"` и ошибок API
