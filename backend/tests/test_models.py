import pytest
from datetime import datetime, timezone
from bson import ObjectId
from app.models import (
    User,
    Category,
    Supplier,
    Product,
    Sale,
    Purchase,
    PurchaseItem,
    StockMovement,
    Forecast,
    ForecastPoint,
    Recommendation,
)


def test_user_model_validation():
    user = User(
        email="owner@smallbusiness.com",
        full_name="Alex Mercer",
        hashed_password="hashed_secure_password_123",
        role="admin",
    )
    assert user.email == "owner@smallbusiness.com"
    assert user.role == "admin"
    assert user.is_active is True
    assert user.created_at is not None


def test_category_and_supplier_models():
    category = Category(
        name="Electronics",
        description="Electronic components and accessories",
    )
    assert category.name == "Electronics"

    supplier = Supplier(
        name="Global Tech Logistics",
        email="contact@globaltech.com",
        lead_time_days=5,
    )
    assert supplier.name == "Global Tech Logistics"
    assert supplier.lead_time_days == 5


def test_product_model_validation():
    cat_id = str(ObjectId())
    supp_id = str(ObjectId())
    product = Product(
        sku="SKU-MICRO-001",
        name="Smart Sensor Unit",
        category_id=cat_id,
        supplier_id=supp_id,
        cost_price=45.50,
        selling_price=89.99,
        current_stock=25,
        reorder_point=15,
        target_stock_level=60,
        safety_stock=10,
    )
    assert product.sku == "SKU-MICRO-001"
    assert product.cost_price == 45.50
    assert product.selling_price == 89.99
    assert product.current_stock == 25


def test_sale_model_validation():
    prod_id = str(ObjectId())
    sale = Sale(
        product_id=prod_id,
        quantity=3,
        unit_price=89.99,
        total_price=269.97,
        sale_date=datetime.now(timezone.utc),
    )
    assert sale.product_id == prod_id
    assert sale.quantity == 3
    assert sale.total_price == 269.97


def test_purchase_model_validation():
    supp_id = str(ObjectId())
    prod_id = str(ObjectId())
    purchase = Purchase(
        supplier_id=supp_id,
        items=[
            PurchaseItem(
                product_id=prod_id,
                quantity=50,
                unit_cost=45.00,
                total_cost=2250.00,
            )
        ],
        total_amount=2250.00,
        status="ordered",
    )
    assert purchase.supplier_id == supp_id
    assert len(purchase.items) == 1
    assert purchase.status == "ordered"


def test_stock_movement_validation():
    prod_id = str(ObjectId())
    movement = StockMovement(
        product_id=prod_id,
        movement_type="purchase_receipt",
        quantity=50,
        previous_stock=10,
        new_stock=60,
        notes="Shipment PO-102 received",
    )
    assert movement.product_id == prod_id
    assert movement.quantity == 50
    assert movement.new_stock == 60


def test_forecast_and_recommendation_models():
    prod_id = str(ObjectId())
    forecast = Forecast(
        product_id=prod_id,
        model_used="exponential_smoothing",
        forecast_period="daily",
        predictions=[
            ForecastPoint(
                date="2026-10-01",
                predicted_demand=12.5,
                lower_bound=10.0,
                upper_bound=15.0,
            )
        ],
        evaluation_metrics={"mae": 1.45, "rmse": 2.10, "mape": 0.08},
    )
    assert forecast.model_used == "exponential_smoothing"
    assert len(forecast.predictions) == 1
    assert forecast.evaluation_metrics["mae"] == 1.45

    recommendation = Recommendation(
        product_id=prod_id,
        forecast_id=str(forecast.id) if forecast.id else str(ObjectId()),
        suggested_order_quantity=35,
        urgency="high",
        reason="Predicted demand exceeds current stock + safety stock within lead time window",
        status="pending",
    )
    assert recommendation.suggested_order_quantity == 35
    assert recommendation.urgency == "high"
    assert recommendation.status == "pending"
