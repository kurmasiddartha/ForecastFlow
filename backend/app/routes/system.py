import logging
from typing import Dict
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database, init_database_indexes
from app.schemas.auth import UserResponse

logger = logging.getLogger("forecastflow.system")

router = APIRouter(prefix="/system", tags=["System Maintenance"])

OPERATIONAL_COLLECTIONS = [
    "products",
    "categories",
    "suppliers",
    "sales",
    "purchases",
    "stock_movements",
    "forecasts",
    "recommendations",
]


@router.post(
    "/reset-data",
    status_code=status.HTTP_200_OK,
    summary="Clear all operational data (keeps user logins)",
    description="Wipes products, categories, suppliers, sales, purchases, stock movements, forecasts, and recommendations while preserving user login accounts.",
)
async def reset_operational_data(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> Dict[str, object]:
    """Wipes all operational test data and re-initializes indexes."""
    deleted_counts: Dict[str, int] = {}
    logger.warning("Operational data reset triggered by user %s (%s)", current_user.email, current_user.id)

    for coll_name in OPERATIONAL_COLLECTIONS:
        collection = db[coll_name]
        result = await collection.delete_many({})
        deleted_counts[coll_name] = result.deleted_count
        logger.info("Deleted %d records from '%s'", result.deleted_count, coll_name)

    # Re-verify and maintain database indexes
    await init_database_indexes(db)

    total_deleted = sum(deleted_counts.values())

    return {
        "status": "success",
        "message": f"Successfully deleted {total_deleted} operational records across {len(OPERATIONAL_COLLECTIONS)} collections. User accounts were preserved.",
        "triggered_by": current_user.email,
        "deleted_counts": deleted_counts,
    }


@router.post(
    "/seed-siddu-shop",
    status_code=status.HTTP_200_OK,
    summary="Seed Siddu Kirana Store demo data and user",
    description="Seeds realistic Kirana store catalog, suppliers, categories, and student/neighborhood sales.",
)
async def seed_kirana_demo(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Dict[str, object]:
    """Wipes old operational data and seeds Siddu Kirana Store demo dataset."""
    from app.services.seed_service import seed_siddu_shop_data
    return await seed_siddu_shop_data(db)

