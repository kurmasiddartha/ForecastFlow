from app.services.auth_service import auth_service, AuthService
from app.services.category_service import category_service, CategoryService
from app.services.supplier_service import supplier_service, SupplierService
from app.services.product_service import product_service, ProductService
from app.services.inventory_service import inventory_service, InventoryService
from app.services.sale_service import sale_service, SaleService
from app.services.purchase_service import purchase_service, PurchaseService

__all__ = [
    "auth_service",
    "AuthService",
    "category_service",
    "CategoryService",
    "supplier_service",
    "SupplierService",
    "product_service",
    "ProductService",
    "inventory_service",
    "InventoryService",
    "sale_service",
    "SaleService",
    "purchase_service",
    "PurchaseService",
]
