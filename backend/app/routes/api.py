from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.categories import router as categories_router
from app.routes.suppliers import router as suppliers_router
from app.routes.products import router as products_router
from app.routes.inventory import router as inventory_router
from app.routes.sales import router as sales_router
from app.routes.purchases import router as purchases_router
from app.routes.analytics import router as analytics_router
from app.routes.forecasting import router as forecasting_router
from app.routes.intelligence import router as intelligence_router
from app.routes.recommendations import router as recommendations_router
from app.routes.system import router as system_router

api_router = APIRouter()

# Register core route modules
api_router.include_router(health_router, prefix="")
api_router.include_router(auth_router, prefix="")
api_router.include_router(categories_router, prefix="")
api_router.include_router(suppliers_router, prefix="")
api_router.include_router(products_router, prefix="")
api_router.include_router(inventory_router, prefix="")
api_router.include_router(sales_router, prefix="")
api_router.include_router(purchases_router, prefix="")
api_router.include_router(analytics_router, prefix="")
api_router.include_router(forecasting_router, prefix="")
api_router.include_router(intelligence_router, prefix="")
api_router.include_router(recommendations_router, prefix="")
api_router.include_router(system_router, prefix="")


