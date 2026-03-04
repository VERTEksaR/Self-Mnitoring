import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Category, User
from backend.finance_app.app.schemas.category import CategoryRead, CategoryCreate
from backend.finance_app.app.schemas.common import Page

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get('/{category_id}', response_model=CategoryRead, status_code=200)
async def get_category(category_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Category).where((Category.id == category_id) & (Category.user_id == current_user.id))
    )
    category = result.scalar_one_or_none()

    if not category:
        logger.error(f"Категория с id {category_id} не была найдена")
        raise HTTPException(status_code=404, detail=f"Категория с id {category_id} не была найдена")

    logger.info(f"Категория с id {category_id} была найдена")
    return category


@router.delete('/{category_id}', status_code=204)
async def delete_category(category_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    category = await session.get(Category, category_id)

    if not category:
        logger.error(f"Категория с id {category_id} не была найдена")
        raise HTTPException(status_code=404, detail=f"Категория с id {category_id} не была найдена")

    await session.delete(category)
    await session.commit()
    logger.info(f"Категория с id {category_id} была удалена")
    return None


@router.post('/', response_model=CategoryRead, status_code=201)
async def create_category(category_data: CategoryCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    category = Category(**category_data.model_dump())
    session.add(category)
    await session.commit()
    logger.info(f"Категория с id {category.id} была создана")
    return category


@router.get('/', response_model=Page[CategoryRead], status_code=200)
async def get_all_categories(page: int = 1, size: int = 10, name: str = '', session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    total_result = await session.execute(
        select(func.count()).where((Category.name.like(f"%{name}%")) & (Category.user_id == current_user.id))
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Category).where((Category.name.like(f"%{name}%")) & (Category.user_id == current_user.id))
    )
    categories = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} категорий")
    return {
        'items': categories,
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }