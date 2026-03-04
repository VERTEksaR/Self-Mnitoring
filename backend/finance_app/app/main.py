from fastapi import FastAPI

from backend.finance_app.app.admin.admin import create_admin
from backend.finance_app.app.routers import categories, transactions, accounts, auth, user

app = FastAPI(title="Finance API")

create_admin(app)

app.include_router(auth.router, prefix='/auth', tags=["auth"])

app.include_router(categories.router, prefix='/categories', tags=["categories"])
app.include_router(accounts.router, prefix='/accounts', tags=["accounts"])
app.include_router(transactions.router, prefix='/transactions', tags=["transactions"])
app.include_router(user.router, prefix='/users', tags=["user"])

@app.get("/ping")
async def ping():
    return {"status": "ok"}