import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from starlette.responses import JSONResponse

from backend.finance_app.app.admin.admin import create_admin
from backend.finance_app.app.core.config import settings
from backend.finance_app.app.exceptions.openai_exceptions import ApplicationError
from backend.finance_app.app.routers.common import auth, user
from backend.finance_app.app.routers.steam import steam
from backend.finance_app.app.routers.trainings import exercises, training_exercises, trainings
from backend.finance_app.app.routers.finances import categories, accounts, transactions
from backend.finance_app.app.routers.languages import languages, tags, reviews, study_sessions, stats
from backend.finance_app.app.utils.note_from_image import OpenAIService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.openai_api_key and settings.openai_model:
        openai_service = OpenAIService()
        app.state.openai_service = openai_service
    else:
        app.state.openai_service = None

    yield

    if app.state.openai_service is not None:
        await app.state.openai_service.close()

app = FastAPI(title="Finance API", lifespan=lifespan)


@app.exception_handler(ApplicationError)
async def application_error_handler(request: Request, exc: ApplicationError):
    logger.warning("%s: %s", type(exc).__name__, exc.message, exc_info=exc)
    return JSONResponse({"detail": exc.user_message}, status_code=exc.status_code)


create_admin(app)

app.include_router(auth.router, prefix='/auth', tags=["auth"])
app.include_router(categories.router, prefix='/categories', tags=["categories"])
app.include_router(accounts.router, prefix='/accounts', tags=["accounts"])
app.include_router(transactions.router, prefix='/transactions', tags=["transactions"])
app.include_router(user.router, prefix='/users', tags=["user"])
app.include_router(exercises.router, prefix='/exercises', tags=["exercises"])
app.include_router(trainings.router, prefix='/trainings', tags=["trainings"])
app.include_router(training_exercises.router, prefix='/training-exercises', tags=["training-exercises"])
app.include_router(steam.router, prefix='/steam', tags=["steam"])
app.include_router(languages.router, prefix='/languages', tags=["languages"])
app.include_router(tags.router, prefix='/languages', tags=["languages"])
app.include_router(reviews.router, prefix='/languages', tags=["languages"])
app.include_router(study_sessions.router, prefix='/languages', tags=["languages"])
app.include_router(stats.router, prefix='/languages', tags=["languages"])

@app.get("/ping")
async def ping():
    return {"status": "ok"}