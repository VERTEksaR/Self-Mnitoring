from sqlalchemy import select
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.core.config import settings
from backend.finance_app.app.core.security import verify_password
from backend.finance_app.app.db.session import engine, get_session
from backend.finance_app.app.db.models import User, Category, Account, Transaction


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        async with AsyncSession(engine) as session:
            result = await session.execute(
                select(User).where(User.email == username)
            )
        user = result.scalar_one_or_none()

        if user and verify_password(password, user.hashed_password) and user.is_admin:
            request.session.update({"admin_id": user.id})
            return True

        return False

    async def logout(self, request: Request):
        request.session.clear()
        return True

    async def authenticate(self, request: Request):
        return request.session.get("admin_id") is not None


class UserAdmin(ModelView, model=User):
    column_list = ["id", "email", "is_active", "is_admin"]


class CategoryAdmin(ModelView, model=Category):
    column_list = ["id", "name"]


class AccountAdmin(ModelView, model=Account):
    column_list = ["id", "name"]


class TransactionAdmin(ModelView, model=Transaction):
    column_list = ["id", "amount", "cashback", "replenishment", "transaction_date"]


def create_admin(app):
    authentication_backend = AdminAuth(secret_key=settings.secret_key)
    admin = Admin(app=app, engine=engine, authentication_backend=authentication_backend)
    admin.add_view(UserAdmin)
    admin.add_view(CategoryAdmin)
    admin.add_view(AccountAdmin)
    admin.add_view(TransactionAdmin)

