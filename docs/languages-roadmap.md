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

- [ ] `'/languages'` в `proxy` в `frontend/vite.config.js` — иначе запросы с фронта не дойдут до бэка
- [ ] `types/languages/*.ts`, `api/languages/*.ts` по образцу `api/trainings/trainings.ts`
- [ ] Роуты `/languages` и `/languages/:languageId` через `ModuleRoute module="languages"`
- [ ] Новый цвет неона (`NeonBackground` + `AppContent`), карточка на `StartPage`
- [ ] Вкладка «Словарь»: поиск, пагинация, модалка создания/редактирования
- [ ] Вкладка «Конспекты»: список, просмотр, редактирование (`textarea`, вывод с `white-space: pre-wrap`)

**Готово, когда:** весь сценарий этапа 1 проходится из UI.

## Этап 3. Теги для слов

- [ ] Модель `WordTag` (unique `(name, language_id)`) + таблица связи `word_tags` (`secondary=`)
- [ ] `Word.tags` с `lazy="selectin"` (иначе `MissingGreenlet` в async)
- [ ] CRUD тегов; `tag_ids` в Create/Change слова; фильтр `?tag_id=`; проверка, что теги из того же языка
- [ ] Фронт: чипсы тегов, мультиселект в форме, фильтр в словаре

## Этап 4. Интервальное повторение (коробки Лейтнера)

- [ ] Чистая функция `next_review(box, remembered, today)` в `utils/`; интервалы 1 / 3 / 7 / 14 / 30 дней; «не помню» → коробка 1, завтра
- [ ] Статус из коробки: 0 — новое, 1–4 — изучаю, 5 — выучено
- [ ] Таблица `WordReview` (слово, время, помнил или нет) — лог для статистики
- [ ] `GET /languages/{id}/review/?limit=20` — слова на сегодня, включая новые
- [ ] `POST /languages/{id}/words/{word_id}/review` с `{remembered}`
- [ ] Фронт: вкладка «Повторение» — карточка, «Помню / Не помню», счётчик
- [ ] pytest-тесты для `next_review`

## Этап 5. Озвучка

- [ ] `speechSynthesis` + `utterance.lang = language.code`
- [ ] Кнопка 🔊 в словаре и на карточке повторения
- [ ] Учесть `voiceschanged` в Chrome; скрывать кнопку, если голоса для языка нет

### 🏁 MVP (этапы 0–5)

- [ ] Мерж `languages` → `main`
- [ ] Обновить README

---

## Техдолг: проверка владения связанными сущностями (после MVP)

Сейчас незаметно, потому что пользователь в БД один; со вторым пользователем это станет реальной дырой.

- [ ] `create_transaction` и `change_transaction` (`routers/finances/transactions.py`): `category_id` и `account_id` из тела запроса принадлежат текущему пользователю, иначе 404 — сейчас можно создать транзакцию на чужой счёт/категорию
- [ ] `create_ex_training` (`routers/trainings/training_exercises.py`): `training_id` и `exercise_id` принадлежат текущему пользователю — сейчас можно добавить упражнение в чужую тренировку
- [ ] Change-схемы во всех модулях: явный `null` в обязательном поле (`{"name": null}`) даёт 500 от БД вместо 422 — добавить `check_not_null = forbid_null(...)` из `schemas/common/common.py`, как в языках
- [ ] Дубли по `UniqueConstraint` (категории, счета, упражнения, тренировки) дают 500 — заменить `session.commit()` на `commit_or_conflict` из `utils/commit.py`
- [ ] Проверить всё со вторым тестовым пользователем

---

## Этап 6. Журнал занятий

- [ ] Модель `StudySession`: дата, минуты, тип (чтение, аудирование, говорение, письмо, грамматика, слова), комментарий
- [ ] CRUD + выборка за период
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
