class ApplicationError(Exception):
    """Базовая ошибка приложения.

    message — технический текст для логов.
    user_message — текст, который увидит пользователь (уходит в "detail").
    """
    status_code = 500
    user_message = "Внутренняя ошибка сервера."

    def __init__(self, message: str, user_message: str | None = None):
        self.message = message
        if user_message is not None:
            self.user_message = user_message
        super().__init__(message)


class OpenAIAPIError(ApplicationError):
    status_code = 502
    user_message = "Сервис ИИ вернул ошибку. Попробуйте позже."


class OpenAITimeoutError(OpenAIAPIError):
    status_code = 504
    user_message = "Сервис ИИ не ответил вовремя. Попробуйте ещё раз."


class OpenAIRateLimitError(OpenAIAPIError):
    status_code = 503
    user_message = "Сервис ИИ временно недоступно. Попробуйте позже."


class OpenAIConnectionError(OpenAIAPIError):
    status_code = 502
    user_message = "Не удалось связаться с сервисом ИИ. Попробуйте позже."


class OpenAIAuthenticationError(OpenAIAPIError):
    status_code = 503
    user_message = "Сервис ИИ временно недоступно. Попробуйте позже."


class OpenAIServiceError(ApplicationError):
    status_code = 500
    user_message = "Не удалось обработать ответ сервиса ИИ."


class OpenAIRefusalError(OpenAIServiceError):
    status_code = 422
    user_message = "Не удалось распознать это фото."


class InsufficientDataError(OpenAIServiceError):
    status_code = 422
    user_messages = {
        "no_text": "На фото не найден текст.",
        "unreadable": "Не удалось разобрать текст. Переснимите фото чётче.",
    }

    def __init__(self, code: str):
        self.code = code
        super().__init__(code, self.user_messages.get(code))


class OpenAIResponseError(OpenAIServiceError):
    status_code = 502
    user_message = "Сервис ИИ вернул неожиданный ответ. Попробуйте ещё раз."


class TranslationUnavailableError(OpenAIServiceError):
    status_code = 503
    user_message = "Перевод временно недоступен. Попробуйте позже."


class TranslationRefusalError(OpenAIRefusalError):
    user_message = "Не удалось перевести выбранное слово."


class TranslationDataError(OpenAIServiceError):
    status_code = 422
    user_messages = {
        "insufficient_context": "Недостаточно контекста для перевода. Выберите более полное предложение.",
        "unrecognized_word": "Не удалось распознать слово. Проверьте его написание.",
        "wrong_language": "Выбранное слово не относится к изучаемому языку.",
    }

    def __init__(self, code: str):
        self.code = code
        super().__init__(code, self.user_messages[code])
