import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import hash_password
from app.database import init_database_indexes

logger = logging.getLogger("forecastflow.seed")

DEMO_USER_EMAIL = "siddu@kirana.com"
DEMO_USER_NAME = "Siddu (Siddu Kirana & General Store)"
DEMO_PASSWORD_PLAIN = "Password123"

# Also support current user email if needed
CURRENT_USER_EMAIL = "kurmasiddartha@gmail.com"


async def seed_siddu_shop_data(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """Wipes operational test data and seeds a full, realistic Kirana store catalog,
    suppliers, categories, and 35 days of student & neighborhood customer sales."""
    logger.info("Starting seed process for Siddu Kirana & General Store...")

    now = datetime.now(timezone.utc)

    # 1. Ensure Demo User Accounts exist and have active credentials
    hashed_pwd = hash_password(DEMO_PASSWORD_PLAIN)
    
    # Siddu Demo User
    await db.users.update_one(
        {"email": DEMO_USER_EMAIL},
        {
            "$set": {
                "email": DEMO_USER_EMAIL,
                "full_name": DEMO_USER_NAME,
                "hashed_password": hashed_pwd,
                "role": "admin",
                "is_active": True,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    
    # Also ensure kurmasiddartha@gmail.com is set up with the same password so currently logged in session works
    await db.users.update_one(
        {"email": CURRENT_USER_EMAIL},
        {
            "$set": {
                "email": CURRENT_USER_EMAIL,
                "full_name": "Kurma Siddartha (Siddu Kirana)",
                "hashed_password": hashed_pwd,
                "role": "admin",
                "is_active": True,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    # 2. Clear previous operational collections
    collections_to_clear = [
        "products",
        "categories",
        "suppliers",
        "sales",
        "purchases",
        "stock_movements",
        "forecasts",
        "recommendations",
    ]
    for coll in collections_to_clear:
        await db[coll].delete_many({})

    # 3. Seed Suppliers
    supplier_defs = [
        {
            "name": "Metro Mandi Super-Wholesale",
            "contact_name": "Ramesh Bhai",
            "email": "metro.mandi.orders@gmail.com",
            "phone": "+91 98450 11223",
            "address": "Yard 4, APMC Market Yard, Outer Ring Road",
            "lead_time_days": 3,
        },
        {
            "name": "Local Dairy & Bakery Morning Route",
            "contact_name": "Suresh Dairy",
            "email": "suresh.dairy.supply@gmail.com",
            "phone": "+91 98450 22334",
            "address": "Shop 12, Cooperative Milk Union Center",
            "lead_time_days": 1,
        },
        {
            "name": "Balaji Snacks & Cold Beverages Agency",
            "contact_name": "Vicky Bhai",
            "email": "balaji.fmcg.agency@gmail.com",
            "phone": "+91 98450 33445",
            "address": "Industrial Area, Near Metro Depot",
            "lead_time_days": 2,
        },
        {
            "name": "Campus Stationery & Essentials Depot",
            "contact_name": "Rajesh Kumar",
            "email": "campus.stationery.depot@gmail.com",
            "phone": "+91 98450 44556",
            "address": "Opposite University Gate 2, College Road",
            "lead_time_days": 2,
        },
    ]

    suppliers_map: Dict[str, ObjectId] = {}
    for s_def in supplier_defs:
        s_doc = {**s_def, "created_at": now, "updated_at": now}
        res = await db.suppliers.insert_one(s_doc)
        suppliers_map[s_def["name"]] = res.inserted_id

    # 4. Seed Categories
    category_defs = [
        {
            "name": "Instant Foods & Snacks",
            "description": "Maggi, noodles, chips, namkeen & biscuits popular with students & evening counter rush.",
        },
        {
            "name": "Cold Beverages & Energy Drinks",
            "description": "Sting, Thums Up, fruit drinks, and cold cans chilled in counter deep freezer.",
        },
        {
            "name": "Daily Dairy & Bakery",
            "description": "Fresh morning milk pouches, farm eggs, curd cups, bread loaves, and butter.",
        },
        {
            "name": "Student Stationery",
            "description": "Exam pens, ruled long registers, adhesive, erasers & last-minute study essentials.",
        },
        {
            "name": "Kitchen Staples & Groceries",
            "description": "Atta bags, cooking oil pouches, toor dal, sugar, salt & daily cooking necessities.",
        },
        {
            "name": "Personal Care & Hygiene",
            "description": "Shampoo sachets, bathing soaps, toothpastes, razor blades, and daily essentials.",
        },
    ]

    categories_map: Dict[str, ObjectId] = {}
    for c_def in category_defs:
        c_doc = {**c_def, "created_at": now, "updated_at": now}
        res = await db.categories.insert_one(c_doc)
        categories_map[c_def["name"]] = res.inserted_id

    # 5. Seed Products specifically tailored for Siddu Kirana Store (Students & Neighborhood)
    product_catalogs = [
        # --- INSTANT FOODS & SNACKS ---
        {
            "sku": "PROD-MAGGI-70",
            "name": "Maggi 2-Minute Masala Instant Noodles 70g",
            "description": "Highest velocity student staple. Consumed daily for lunch, evening snack, and midnight study sessions.",
            "category": "Instant Foods & Snacks",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pack",
            "cost_price": 11.50,
            "selling_price": 14.00,
            "current_stock": 65,
            "reorder_point": 30,
            "target_stock_level": 120,
            "safety_stock": 25,
            "daily_velocity_mean": 18,
        },
        {
            "sku": "PROD-YIPPEE-65",
            "name": "Sunfeast Yippee Magic Masala Noodles 65g",
            "description": "Popular non-sticky noodle alternative with high repeat counter sales.",
            "category": "Instant Foods & Snacks",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pack",
            "cost_price": 10.00,
            "selling_price": 12.00,
            "current_stock": 28,
            "reorder_point": 20,
            "target_stock_level": 60,
            "safety_stock": 15,
            "daily_velocity_mean": 8,
        },
        {
            "sku": "PROD-LAYS-MAGIC",
            "name": "Lays India's Magic Masala Chips 50g",
            "description": "Crispy blue packet chips, popular evening counter snack with tea or cold drink.",
            "category": "Instant Foods & Snacks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "pack",
            "cost_price": 16.50,
            "selling_price": 20.00,
            "current_stock": 24,
            "reorder_point": 18,
            "target_stock_level": 60,
            "safety_stock": 12,
            "daily_velocity_mean": 10,
        },
        {
            "sku": "PROD-KURKURE-45",
            "name": "Kurkure Masala Munch 45g",
            "description": "Spicy puffed snack packet favorite among hostel students.",
            "category": "Instant Foods & Snacks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "pack",
            "cost_price": 16.50,
            "selling_price": 20.00,
            "current_stock": 19,
            "reorder_point": 15,
            "target_stock_level": 50,
            "safety_stock": 10,
            "daily_velocity_mean": 9,
        },
        {
            "sku": "PROD-PARLEG-100",
            "name": "Parle-G Gold Glucose Biscuits 100g",
            "description": "Evergreen tea-time biscuit sold in bulk every morning and evening.",
            "category": "Instant Foods & Snacks",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pack",
            "cost_price": 8.50,
            "selling_price": 10.00,
            "current_stock": 55,
            "reorder_point": 25,
            "target_stock_level": 100,
            "safety_stock": 20,
            "daily_velocity_mean": 14,
        },
        {
            "sku": "PROD-OREO-120",
            "name": "Cadbury Oreo Vanilla Cream Biscuits 120g",
            "description": "Dark chocolate sandwich biscuit with vanilla cream.",
            "category": "Instant Foods & Snacks",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pack",
            "cost_price": 29.00,
            "selling_price": 35.00,
            "current_stock": 16,
            "reorder_point": 12,
            "target_stock_level": 40,
            "safety_stock": 8,
            "daily_velocity_mean": 4,
        },
        {
            "sku": "PROD-DAIRYMILK-50",
            "name": "Cadbury Dairy Milk Chocolate Bar 50g",
            "description": "Smooth milk chocolate bar displayed directly on the front checkout glass counter.",
            "category": "Instant Foods & Snacks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "bar",
            "cost_price": 38.00,
            "selling_price": 45.00,
            "current_stock": 0,  # OUT OF STOCK!
            "reorder_point": 15,
            "target_stock_level": 45,
            "safety_stock": 10,
            "daily_velocity_mean": 7,
        },

        # --- BEVERAGES & ENERGY DRINKS ---
        {
            "sku": "PROD-STING-250",
            "name": "Sting Energy Drink Pet Bottle 250ml",
            "description": "Massive student hit drink. Red color sweet caffeinated energy drink flying off counter.",
            "category": "Cold Beverages & Energy Drinks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "bottle",
            "cost_price": 16.20,
            "selling_price": 20.00,
            "current_stock": 4,  # CRITICAL LOW STOCK!
            "reorder_point": 24,
            "target_stock_level": 96,
            "safety_stock": 18,
            "daily_velocity_mean": 16,
        },
        {
            "sku": "PROD-THUMSUP-300",
            "name": "Thums Up Toofani Carbonated Can 300ml",
            "description": "Strong cola beverage popular after college hours and sports.",
            "category": "Cold Beverages & Energy Drinks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "can",
            "cost_price": 32.00,
            "selling_price": 40.00,
            "current_stock": 3,  # CRITICAL STOCKOUT RISK!
            "reorder_point": 18,
            "target_stock_level": 50,
            "safety_stock": 10,
            "daily_velocity_mean": 6,
        },
        {
            "sku": "PROD-REDBULL-250",
            "name": "Red Bull Energy Drink Premium Can 250ml",
            "description": "Expensive imported energy drink. Very slow counter movement compared to ₹20 Sting.",
            "category": "Cold Beverages & Energy Drinks",
            "supplier": "Balaji Snacks & Cold Beverages Agency",
            "unit": "can",
            "cost_price": 98.00,
            "selling_price": 125.00,
            "current_stock": 40,  # DEAD STOCK / OVERSTOCK!
            "reorder_point": 8,
            "target_stock_level": 20,
            "safety_stock": 4,
            "daily_velocity_mean": 0.3,
        },
        {
            "sku": "PROD-NESCAFE-25",
            "name": "Nescafe Classic 100% Pure Instant Coffee 25g",
            "description": "Glass jar instant coffee for students studying overnight.",
            "category": "Cold Beverages & Energy Drinks",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "jar",
            "cost_price": 82.00,
            "selling_price": 95.00,
            "current_stock": 7,  # LOW STOCK
            "reorder_point": 10,
            "target_stock_level": 30,
            "safety_stock": 6,
            "daily_velocity_mean": 3,
        },

        # --- DAILY DAIRY & BAKERY ---
        {
            "sku": "PROD-MILK-500",
            "name": "Amul Taaza Homogenised Toned Milk 500ml",
            "description": "Daily staple milk pouch for tea, coffee, and hostel breakfast.",
            "category": "Daily Dairy & Bakery",
            "supplier": "Local Dairy & Bakery Morning Route",
            "unit": "pouch",
            "cost_price": 25.00,
            "selling_price": 28.00,
            "current_stock": 25,
            "reorder_point": 20,
            "target_stock_level": 60,
            "safety_stock": 15,
            "daily_velocity_mean": 18,
        },
        {
            "sku": "PROD-EGGS-6",
            "name": "Fresh Farm White Eggs (Carton of 6)",
            "description": "Quick high-protein breakfast and post-workout staple for gymgoers & students.",
            "category": "Daily Dairy & Bakery",
            "supplier": "Local Dairy & Bakery Morning Route",
            "unit": "carton",
            "cost_price": 35.00,
            "selling_price": 42.00,
            "current_stock": 5,  # REORDER SOON
            "reorder_point": 15,
            "target_stock_level": 40,
            "safety_stock": 10,
            "daily_velocity_mean": 8,
        },
        {
            "sku": "PROD-BREAD-400",
            "name": "Modern White Sliced Sandwich Bread 400g",
            "description": "Soft sliced sandwich bread loaf.",
            "category": "Daily Dairy & Bakery",
            "supplier": "Local Dairy & Bakery Morning Route",
            "unit": "loaf",
            "cost_price": 30.00,
            "selling_price": 35.00,
            "current_stock": 14,
            "reorder_point": 12,
            "target_stock_level": 35,
            "safety_stock": 8,
            "daily_velocity_mean": 7,
        },
        {
            "sku": "PROD-CURD-200",
            "name": "Milky Mist Cup Curd Dahi 200g",
            "description": "Chilled pasteurized cup curd for lunch accompaniment.",
            "category": "Daily Dairy & Bakery",
            "supplier": "Local Dairy & Bakery Morning Route",
            "unit": "cup",
            "cost_price": 21.00,
            "selling_price": 25.00,
            "current_stock": 18,
            "reorder_point": 12,
            "target_stock_level": 35,
            "safety_stock": 6,
            "daily_velocity_mean": 5,
        },

        # --- STUDENT STATIONERY ---
        {
            "sku": "PROD-NOTEBOOK-160",
            "name": "Classmate Long Notebook Ruled 160 Pages",
            "description": "Standard college register notebook with index and smooth page writing surface.",
            "category": "Student Stationery",
            "supplier": "Campus Stationery & Essentials Depot",
            "unit": "book",
            "cost_price": 42.00,
            "selling_price": 55.00,
            "current_stock": 35,
            "reorder_point": 20,
            "target_stock_level": 70,
            "safety_stock": 15,
            "daily_velocity_mean": 7,
        },
        {
            "sku": "PROD-PEN-REYNOLDS",
            "name": "Reynolds 045 Fine Carbure Ballpoint Pen Blue",
            "description": "Iconic blue exam ballpen. Sold individually at the counter.",
            "category": "Student Stationery",
            "supplier": "Campus Stationery & Essentials Depot",
            "unit": "pcs",
            "cost_price": 7.00,
            "selling_price": 10.00,
            "current_stock": 70,
            "reorder_point": 30,
            "target_stock_level": 150,
            "safety_stock": 25,
            "daily_velocity_mean": 12,
        },
        {
            "sku": "PROD-FEVIKWIK-1G",
            "name": "Fevikwik Instant Adhesive Drop 1g Tube",
            "description": "Instant 1-second glue drop packet mounted near billing counter.",
            "category": "Student Stationery",
            "supplier": "Campus Stationery & Essentials Depot",
            "unit": "tube",
            "cost_price": 4.10,
            "selling_price": 5.00,
            "current_stock": 45,
            "reorder_point": 20,
            "target_stock_level": 100,
            "safety_stock": 15,
            "daily_velocity_mean": 6,
        },

        # --- KITCHEN STAPLES & GROCERIES ---
        {
            "sku": "PROD-ATTA-5KG",
            "name": "Aashirvaad Shudh Chakki Whole Wheat Atta 5kg",
            "description": "Premium 100% MP whole wheat flour. Core grocery purchase for residential families.",
            "category": "Kitchen Staples & Groceries",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "bag",
            "cost_price": 215.00,
            "selling_price": 250.00,
            "current_stock": 12,
            "reorder_point": 8,
            "target_stock_level": 25,
            "safety_stock": 5,
            "daily_velocity_mean": 2,
        },
        {
            "sku": "PROD-OIL-1L",
            "name": "Fortune Sunlite Refined Sunflower Oil 1L Pouch",
            "description": "Light, refined cooking oil with natural vitamin E.",
            "category": "Kitchen Staples & Groceries",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pouch",
            "cost_price": 115.00,
            "selling_price": 135.00,
            "current_stock": 15,
            "reorder_point": 10,
            "target_stock_level": 30,
            "safety_stock": 6,
            "daily_velocity_mean": 3,
        },
        {
            "sku": "PROD-TOORDAL-1KG",
            "name": "Tata Sampann Unpolished Toor Dal 1kg",
            "description": "High protein pulse unpolished without water/marble powder.",
            "category": "Kitchen Staples & Groceries",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "kg",
            "cost_price": 142.00,
            "selling_price": 165.00,
            "current_stock": 11,
            "reorder_point": 8,
            "target_stock_level": 25,
            "safety_stock": 5,
            "daily_velocity_mean": 2,
        },
        {
            "sku": "PROD-SUGAR-1KG",
            "name": "Madhur Pure & Hygienic Refined Sugar 1kg",
            "description": "Sulphur-free clean sparkling white sugar granules.",
            "category": "Kitchen Staples & Groceries",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "kg",
            "cost_price": 42.00,
            "selling_price": 48.00,
            "current_stock": 28,
            "reorder_point": 15,
            "target_stock_level": 50,
            "safety_stock": 10,
            "daily_velocity_mean": 4,
        },
        {
            "sku": "PROD-SALT-1KG",
            "name": "Tata Salt Vacuum Evaporated Iodised Salt 1kg",
            "description": "Desh ka namak. Essential cooking salt packet with iodine.",
            "category": "Kitchen Staples & Groceries",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "kg",
            "cost_price": 23.00,
            "selling_price": 28.00,
            "current_stock": 32,
            "reorder_point": 15,
            "target_stock_level": 50,
            "safety_stock": 10,
            "daily_velocity_mean": 3,
        },

        # --- PERSONAL CARE ---
        {
            "sku": "PROD-DOVE-75",
            "name": "Dove Cream Beauty Bathing Bar 75g",
            "description": "Moisturizing beauty cream bathing soap.",
            "category": "Personal Care & Hygiene",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "bar",
            "cost_price": 48.00,
            "selling_price": 58.00,
            "current_stock": 18,
            "reorder_point": 10,
            "target_stock_level": 30,
            "safety_stock": 6,
            "daily_velocity_mean": 2,
        },
        {
            "sku": "PROD-COLGATE-100",
            "name": "Colgate Strong Teeth Dental Paste 100g",
            "description": "Amino shakti calcium formula dental toothpaste.",
            "category": "Personal Care & Hygiene",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "tube",
            "cost_price": 54.00,
            "selling_price": 65.00,
            "current_stock": 16,
            "reorder_point": 10,
            "target_stock_level": 30,
            "safety_stock": 6,
            "daily_velocity_mean": 2,
        },
        {
            "sku": "PROD-RAZOR-GILLETTE",
            "name": "Gillette Vector Plus Manual Shaving Razor",
            "description": "Twin blade razor handle with lubricating strip. Very slow turnover.",
            "category": "Personal Care & Hygiene",
            "supplier": "Metro Mandi Super-Wholesale",
            "unit": "pack",
            "cost_price": 68.00,
            "selling_price": 85.00,
            "current_stock": 30,  # OVERSTOCK
            "reorder_point": 6,
            "target_stock_level": 15,
            "safety_stock": 3,
            "daily_velocity_mean": 0.2,
        },
    ]

    products_map: Dict[str, Dict[str, Any]] = {}
    for p_def in product_catalogs:
        cat_id = categories_map[p_def["category"]]
        sup_id = suppliers_map[p_def["supplier"]]
        p_doc = {
            "sku": p_def["sku"],
            "name": p_def["name"],
            "description": p_def["description"],
            "category_id": cat_id,
            "supplier_id": sup_id,
            "unit": p_def["unit"],
            "cost_price": p_def["cost_price"],
            "selling_price": p_def["selling_price"],
            "current_stock": p_def["current_stock"],
            "reorder_point": p_def["reorder_point"],
            "target_stock_level": p_def["target_stock_level"],
            "safety_stock": p_def["safety_stock"],
            "is_active": True,
            "created_at": now - timedelta(days=60),
            "updated_at": now,
        }
        res = await db.products.insert_one(p_doc)
        p_doc["_id"] = res.inserted_id
        p_doc["daily_velocity_mean"] = p_def["daily_velocity_mean"]
        products_map[p_def["sku"]] = p_doc

    # 6. Generate 35 Days of Realistic Daily Sales Transactions
    random.seed(42)
    sales_docs = []
    stock_movements = []

    # Common customer basket profiles
    basket_archetypes = [
        # Student afternoon snack
        ["PROD-MAGGI-70", "PROD-STING-250"],
        ["PROD-LAYS-MAGIC", "PROD-THUMSUP-300"],
        ["PROD-KURKURE-45", "PROD-STING-250"],
        # Study late night
        ["PROD-MAGGI-70", "PROD-NESCAFE-25", "PROD-PARLEG-100"],
        ["PROD-OREO-120", "PROD-MILK-500"],
        # Morning breakfast & hostel essentials
        ["PROD-MILK-500", "PROD-BREAD-400", "PROD-EGGS-6"],
        ["PROD-MILK-500", "PROD-PARLEG-100"],
        # Student stationery quick buy
        ["PROD-NOTEBOOK-160", "PROD-PEN-REYNOLDS"],
        ["PROD-PEN-REYNOLDS", "PROD-FEVIKWIK-1G"],
        # Family cooking / bachelor kitchen
        ["PROD-ATTA-5KG", "PROD-OIL-1L", "PROD-SALT-1KG"],
        ["PROD-TOORDAL-1KG", "PROD-SUGAR-1KG"],
        # Personal hygiene
        ["PROD-DOVE-75", "PROD-COLGATE-100"],
    ]

    total_sales_value = 0.0
    total_units_sold = 0

    for day_offset in range(35, 0, -1):
        day_date = now - timedelta(days=day_offset)
        # Weekends have 25% higher volume from hostel students and families
        is_weekend = day_date.weekday() in [5, 6]
        orders_today = random.randint(4, 8) if is_weekend else random.randint(3, 6)

        for _ in range(orders_today):
            basket = random.choice(basket_archetypes)
            # Add occasional random second snack
            if random.random() > 0.6:
                basket = list(set(basket + [random.choice(["PROD-MAGGI-70", "PROD-STING-250", "PROD-PARLEG-100"])]))

            sale_items = []
            sale_total = 0.0

            for sku in basket:
                prod = products_map[sku]
                # Quantity varies by item
                if sku in ["PROD-MAGGI-70", "PROD-STING-250", "PROD-PARLEG-100"]:
                    qty = random.randint(1, 4)
                elif sku in ["PROD-PEN-REYNOLDS", "PROD-EGGS-6"]:
                    qty = random.randint(1, 2)
                else:
                    qty = 1

                line_total = round(qty * prod["selling_price"], 2)
                sale_items.append({
                    "product_id": prod["_id"],
                    "quantity": qty,
                    "unit_price": prod["selling_price"],
                    "total_price": line_total,
                })
                sale_total += line_total
                total_units_sold += qty

            # Stagger transaction hour: 8:00 to 22:00
            hour = random.choice([8, 9, 11, 13, 16, 17, 18, 19, 20, 21])
            minute = random.randint(0, 59)
            tx_time = day_date.replace(hour=hour, minute=minute, second=random.randint(0, 59))

            sale_doc = {
                "items": sale_items,
                "total_amount": round(sale_total, 2),
                "sale_date": tx_time,
                "notes": "Counter pos cash sale",
                "product_id": sale_items[0]["product_id"],
                "quantity": sale_items[0]["quantity"],
                "unit_price": sale_items[0]["unit_price"],
                "total_price": sale_items[0]["total_price"],
                "created_at": tx_time,
                "updated_at": tx_time,
            }
            sales_docs.append(sale_doc)
            total_sales_value += sale_total

    if sales_docs:
        await db.sales.insert_many(sales_docs)

    # 7. Generate Initial Restock Recommendations based on current stock
    # For critical products like Sting, Cadbury Dairy Milk, Thums Up, and Eggs
    recommendations_docs = []
    
    # 1. Sting Energy Drink
    sting = products_map["PROD-STING-250"]
    recommendations_docs.append({
        "product_id": sting["_id"],
        "product_name": sting["name"],
        "product_sku": sting["sku"],
        "category_id": sting["category_id"],
        "supplier_id": sting["supplier_id"],
        "current_stock": sting["current_stock"],
        "incoming_stock": 0,
        "forecast_demand": 48.0,
        "lead_time_days": 2,
        "safety_stock": sting["safety_stock"],
        "reorder_level": sting.get("reorder_point", 15),
        "suggested_order_quantity": 62,
        "unit_cost": sting["cost_price"],
        "estimated_cost": round(62 * sting["cost_price"], 2),
        "urgency": "critical",
        "reason": "Sting demand is running high during exam season; current stock of 4 is below safety stock.",
        "risk_factors": ["High demand velocity", "Stock below reorder threshold"],
        "status": "pending",
        "formula_breakdown": {
            "forecast_demand": 48.0,
            "safety_stock": 18,
            "gross_target": 66.0,
            "current_stock": 4,
            "incoming_stock": 0,
            "total_available": 4,
            "net_shortfall": 62.0,
            "recommended_order": 62,
            "formula_text": "[Forecast Demand (48.0u) + Safety Stock (18u)] - [Current Stock (4u) + Incoming Stock (0u)] = Recommended: 62u",
        },
        "created_at": now,
        "updated_at": now,
    })

    # 2. Cadbury Dairy Milk (Out of stock)
    dm = products_map["PROD-DAIRYMILK-50"]
    recommendations_docs.append({
        "product_id": dm["_id"],
        "product_name": dm["name"],
        "product_sku": dm["sku"],
        "category_id": dm["category_id"],
        "supplier_id": dm["supplier_id"],
        "current_stock": 0,
        "incoming_stock": 0,
        "forecast_demand": 21.0,
        "lead_time_days": 2,
        "safety_stock": dm["safety_stock"],
        "reorder_level": dm.get("reorder_point", 10),
        "suggested_order_quantity": 35,
        "unit_cost": dm["cost_price"],
        "estimated_cost": round(35 * dm["cost_price"], 2),
        "urgency": "critical",
        "reason": "Zero inventory on hand for popular chocolate bar; restock urgently required.",
        "risk_factors": ["Zero physical stock", "No open purchase orders"],
        "status": "pending",
        "formula_breakdown": {
            "forecast_demand": 21.0,
            "safety_stock": 10,
            "gross_target": 31.0,
            "current_stock": 0,
            "incoming_stock": 0,
            "total_available": 0,
            "net_shortfall": 31.0,
            "recommended_order": 35,
            "formula_text": "[Forecast Demand (21.0u) + Safety Stock (10u)] - [Current Stock (0u) + Incoming Stock (0u)] = Recommended: 35u",
        },
        "created_at": now,
        "updated_at": now,
    })

    # 3. Thums Up Cans
    tu = products_map["PROD-THUMSUP-300"]
    recommendations_docs.append({
        "product_id": tu["_id"],
        "product_name": tu["name"],
        "product_sku": tu["sku"],
        "category_id": tu["category_id"],
        "supplier_id": tu["supplier_id"],
        "current_stock": tu["current_stock"],
        "incoming_stock": 0,
        "forecast_demand": 24.0,
        "lead_time_days": 2,
        "safety_stock": tu["safety_stock"],
        "reorder_level": tu.get("reorder_point", 10),
        "suggested_order_quantity": 30,
        "unit_cost": tu["cost_price"],
        "estimated_cost": round(30 * tu["cost_price"], 2),
        "urgency": "high",
        "reason": "Current stock of 3 is below safety buffer; daily sales require replenishment.",
        "risk_factors": ["Stock depleted to 3 units"],
        "status": "pending",
        "formula_breakdown": {
            "forecast_demand": 24.0,
            "safety_stock": 10,
            "gross_target": 34.0,
            "current_stock": 3,
            "incoming_stock": 0,
            "total_available": 3,
            "net_shortfall": 31.0,
            "recommended_order": 30,
            "formula_text": "[Forecast Demand (24.0u) + Safety Stock (10u)] - [Current Stock (3u) + Incoming Stock (0u)] = Recommended: 30u",
        },
        "created_at": now,
        "updated_at": now,
    })

    # 4. Fresh Eggs 6-pack
    eggs = products_map["PROD-EGGS-6"]
    recommendations_docs.append({
        "product_id": eggs["_id"],
        "product_name": eggs["name"],
        "product_sku": eggs["sku"],
        "category_id": eggs["category_id"],
        "supplier_id": eggs["supplier_id"],
        "current_stock": eggs["current_stock"],
        "incoming_stock": 0,
        "forecast_demand": 25.0,
        "lead_time_days": 1,
        "safety_stock": eggs["safety_stock"],
        "reorder_level": eggs.get("reorder_point", 8),
        "suggested_order_quantity": 25,
        "unit_cost": eggs["cost_price"],
        "estimated_cost": round(25 * eggs["cost_price"], 2),
        "urgency": "high",
        "reason": "Daily breakfast item with fast turnaround; restock 25 units for 1-day lead time.",
        "risk_factors": ["Perishable grocery demand", "High morning turnover"],
        "status": "pending",
        "formula_breakdown": {
            "forecast_demand": 25.0,
            "safety_stock": 6,
            "gross_target": 31.0,
            "current_stock": 5,
            "incoming_stock": 0,
            "total_available": 5,
            "net_shortfall": 26.0,
            "recommended_order": 25,
            "formula_text": "[Forecast Demand (25.0u) + Safety Stock (6u)] - [Current Stock (5u) + Incoming Stock (0u)] = Recommended: 25u",
        },
        "created_at": now,
        "updated_at": now,
    })

    if recommendations_docs:
        await db.recommendations.insert_many(recommendations_docs)

    # 8. Re-index MongoDB collections
    await init_database_indexes(db)

    logger.info(
        "Successfully seeded Siddu Kirana Store: %d products, %d categories, %d suppliers, %d sales ($%.2f), %d recommendations.",
        len(product_catalogs),
        len(category_defs),
        len(supplier_defs),
        len(sales_docs),
        total_sales_value,
        len(recommendations_docs),
    )

    return {
        "status": "success",
        "message": f"Successfully seeded Siddu Kirana Store for students & neighborhood shoppers!",
        "demo_user": {
            "email": DEMO_USER_EMAIL,
            "password": DEMO_PASSWORD_PLAIN,
            "name": DEMO_USER_NAME,
        },
        "stats": {
            "categories_count": len(category_defs),
            "suppliers_count": len(supplier_defs),
            "products_count": len(product_catalogs),
            "sales_count": len(sales_docs),
            "total_sales_revenue": round(total_sales_value, 2),
            "total_units_sold": total_units_sold,
            "recommendations_count": len(recommendations_docs),
        },
    }
