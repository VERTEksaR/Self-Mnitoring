import base64

import openai
from openai import APITimeoutError, RateLimitError, AuthenticationError, APIConnectionError, APIStatusError

from backend.finance_app.app.core.config import settings
from backend.finance_app.app.exceptions.openai_exceptions import OpenAIRefusalError, InsufficientDataError, \
    OpenAIResponseError, OpenAITimeoutError, OpenAIRateLimitError, OpenAIAuthenticationError, OpenAIConnectionError, \
    OpenAIAPIError
from backend.finance_app.app.schemas.languages.note import NoteRecognition

PROMPT = """
    Ты переписываешь рукописный конспект с фото в Markdown. Ответ — JSON по заданной схеме с полями error, title и markdown.

    Поле error:
    - null — если на фото есть текст и его удалось переписать, даже если отдельные слова пришлось пометить [неразборчиво].
    - "no_text" — если на фото нет текста (пустой лист, посторонний снимок).
    - "unreadable" — если текст есть, но почти ничего нельзя разобрать (размыто, слишком темно, обрезано).
    Если error не null, то title = null, а markdown = "".
    
    Поле title — название конспекта:
    - Если на странице есть заголовок (строка, явно выделенная как заголовок), перепиши первый такой заголовок дословно, без символов #.
    - Обрывок предложения с прошлой страницы в начале листа заголовком не считается и в title не попадает.
    - Если заголовка на странице нет, придумай короткое название по содержанию (2–6 слов) на языке конспекта.
    
    Поле markdown — полный текст страницы.
    
    Как переписывать текст:
    - Перепиши ВСЮ страницу, от самой верхней строки до последней. Начни с первой строки листа, даже если это обрывок предложения с прошлой страницы: он остаётся в начале markdown обычным текстом. Ничего не пропускай.
    - Пиши дословно, как в конспекте: не перефразируй, не сокращай, не дополняй и не исправляй ошибки автора.
    - Не раскрывай сокращения (т.к., т.е., МБ, инфа и т.п.) и не заменяй разговорные слова литературными.
    - Аббревиатуры и их расшифровки переписывай буква в букву, как на фото. Не подставляй известную тебе расшифровку, если на фото написано иначе.
    - Не подбирай слова по смыслу. Если слово или его часть читается плохо, напиши [неразборчиво].
    - Не переводи текст. Язык определи по написанным символам; если на странице несколько языков, оставь каждое слово как есть.
    - Зачёркнутый текст не переписывай.
    
    Как оформлять:
    - Слово, перенесённое на другую строку через дефис, соедини в одно слово.
    - Строки одного абзаца объединяй в один абзац: переносы строк в тетради не важны. Новый абзац — там, где в конспекте начинается новая мысль или новый термин.
    - Заголовки (#, ##) — только для строк, которые в конспекте явно выделены как заголовки (написаны по центру, отдельно, крупнее или подчёркнуты). Термины в начале строки заголовками не делай. Своих заголовков не добавляй.
    - Заголовок, вынесенный в title, остаётся и в markdown на своём месте.
    - Нумерованные и маркированные перечисления оформляй списками.
    - Схемы и рисунки кратко описывай в блоке-цитате: > [схема: ...]
    - В markdown только Markdown, без пояснений, комментариев и без обёртки ```.
"""


class OpenAIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=30,
            max_retries=1
        )

    async def generate_response(self, image: bytes, mime: str) -> NoteRecognition:
        base64_image = base64.b64encode(image).decode("utf-8")

        try:
            response = await self.client.responses.parse(
                model=settings.openai_model,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": PROMPT,
                            },
                            {
                                "type": "input_image",
                                "image_url": f"data:{mime};base64,{base64_image}"
                            }
                        ]
                    }
                ],
                text_format=NoteRecognition
            )

            if response.output_parsed is None:
                if response.status != "completed":
                    raise OpenAIResponseError(
                        f"Response status: {response.status}"
                    )

                for item in response.output:
                    if item.type == 'message':
                        for content in item.content:
                            if content.type == 'refusal':
                                raise OpenAIRefusalError(content.refusal)

                raise OpenAIResponseError("Empty response")

            result = response.output_parsed

            if result.error is not None:
                raise InsufficientDataError(result.error)

            return result
        except APITimeoutError as exc:
            raise OpenAITimeoutError("OpenAI timeout") from exc

        except RateLimitError as exc:
            raise OpenAIRateLimitError("OpenAI rate limit") from exc

        except AuthenticationError as exc:
            raise OpenAIAuthenticationError("OpenAI authentication error") from exc

        except APIConnectionError as exc:
            raise OpenAIConnectionError("OpenAI connection error") from exc

        except APIStatusError as exc:
            raise OpenAIAPIError(f"OpenAI returned HTTP {exc.status_code}") from exc

    async def close(self):
        await self.client.close()
