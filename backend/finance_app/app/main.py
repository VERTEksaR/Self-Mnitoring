from fastapi import FastAPI

from backend.finance_app.app.admin.admin import create_admin
from backend.finance_app.app.routers.common import auth, user
from backend.finance_app.app.routers.steam import steam
from backend.finance_app.app.routers.trainings import exercises, training_exercises, trainings
from backend.finance_app.app.routers.finances import categories, accounts, transactions

app = FastAPI(title="Finance API")

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

@app.get("/ping")
async def ping():
    return {"status": "ok"}