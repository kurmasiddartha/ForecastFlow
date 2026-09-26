from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.recommendation import (
    ConvertToPurchaseResponse,
    RecommendationGenerateRequest,
    RecommendationListResponse,
    RecommendationResponse,
    RecommendationStatusUpdateRequest,
)
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Restock Recommendations & Procurement"])


@router.post(
    "/generate",
    response_model=List[RecommendationResponse],
    summary="Generate restock recommendations using demand forecast and inventory state",
    description=(
        "Executes transparent formula-driven restocking calculations. Considers forecasted demand, "
        "physical stock, open purchase orders, safety stock, and supplier lead time. "
        "Categorizes urgency into critical, high, medium, and low."
    ),
)
async def generate_restock_recommendations(
    request: RecommendationGenerateRequest = RecommendationGenerateRequest(),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[RecommendationResponse]:
    return await recommendation_service.generate_recommendations(db=db, request=request)


@router.get(
    "",
    response_model=RecommendationListResponse,
    summary="List restock recommendations with executive procurement summary",
    description="Retrieves paginated recommendations with filtering by urgency, status, category, and supplier.",
)
async def get_recommendations_list(
    status_filter: Optional[str] = Query(default="pending", description="Status: 'pending', 'approved', 'ordered', 'dismissed', or 'ALL'"),
    urgency: Optional[str] = Query(default=None, description="Urgency: 'critical', 'high', 'medium', 'low', or 'ALL'"),
    category_id: Optional[str] = Query(default=None, description="Category filter"),
    supplier_id: Optional[str] = Query(default=None, description="Supplier filter"),
    search: Optional[str] = Query(default=None, description="Search product name, SKU, or supplier"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=25, ge=1, le=200, description="Items per page"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> RecommendationListResponse:
    return await recommendation_service.get_recommendations_list(
        db=db,
        status_filter=status_filter,
        urgency_filter=urgency,
        category_id=category_id,
        supplier_id=supplier_id,
        search=search,
        page=page,
        limit=limit,
    )


@router.patch(
    "/{recommendation_id}/status",
    response_model=RecommendationResponse,
    summary="Update recommendation status (e.g. approve or dismiss)",
    description="Changes recommendation status between pending, approved, and dismissed.",
)
async def update_recommendation_status(
    recommendation_id: str,
    payload: RecommendationStatusUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> RecommendationResponse:
    return await recommendation_service.update_recommendation_status(
        db=db,
        recommendation_id=recommendation_id,
        new_status=payload.status,
    )


@router.post(
    "/{recommendation_id}/convert-to-purchase",
    response_model=ConvertToPurchaseResponse,
    summary="Convert restock recommendation to a formal Purchase Order",
    description="Directly creates an active Purchase Order in the database from the recommendation.",
)
async def convert_recommendation_to_purchase(
    recommendation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> ConvertToPurchaseResponse:
    return await recommendation_service.convert_to_purchase_order(
        db=db,
        recommendation_id=recommendation_id,
    )
