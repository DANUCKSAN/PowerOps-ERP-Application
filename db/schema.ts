import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "WAREHOUSE_MANAGER",
  "WAREHOUSE_STAFF",
  "VIEWER",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "DISABLED",
  "INVITED",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  role: userRoleEnum("role").notNull().default("VIEWER"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productStatusEnum = pgEnum("product_status", [
  "ACTIVE",
  "INACTIVE",
  "DISCONTINUED",
]);

export const productCategoryEnum = pgEnum("product_category", [
  "SOLAR_PANEL",
  "BATTERY",
  "INVERTER",
  "EV_CHARGER",
  "HEAT_PUMP",
  "MOUNTING",
  "CABLE",
  "ACCESSORY",
]);

export const warehouseTypeEnum = pgEnum("warehouse_type", [
  "MAIN",
  "SERVICE_VAN",
  "PROJECT_SITE",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "PURCHASE_RECEIVED",
  "MANUAL_ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "PROJECT_ALLOCATION",
  "RETURNED_FROM_SITE",
  "DAMAGED",
]);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "ORDERED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  abn: text("abn"),
  addressLine1: text("address_line_1"),
  suburb: text("suburb"),
  state: text("state"),
  postcode: text("postcode"),
  country: text("country").notNull().default("Australia"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    category: productCategoryEnum("category").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    description: text("description"),
    supplierId: text("supplier_id").references(() => suppliers.id),

    unitOfMeasure: text("unit_of_measure").notNull().default("unit"),
    status: productStatusEnum("status").notNull().default("ACTIVE"),
    reorderPoint: integer("reorder_point").notNull().default(0),
    preferredStockLevel: integer("preferred_stock_level").notNull().default(0),
    averageCost: numeric("average_cost", {
      precision: 12,
      scale: 2,
    }).notNull().default("0.00"),

    powerRatingW: integer("power_rating_w"),
    capacityKwh: numeric("capacity_kwh", { precision: 8, scale: 2 }),
    phase: text("phase"),
    voltage: text("voltage"),
    currentAmp: numeric("current_amp", { precision: 8, scale: 2 }),
    warrantyYears: integer("warranty_years"),
    panelCellType: text("panel_cell_type"),
    batteryChemistry: text("battery_chemistry"),
    inverterType: text("inverter_type"),
    evConnectorType: text("ev_connector_type"),
    heatPumpTankLitres: integer("heat_pump_tank_litres"),
    cableCoreSizeMm: numeric("cable_core_size_mm", {
      precision: 8,
      scale: 2,
    }),
    ipRating: text("ip_rating"),
    dimensionsMm: text("dimensions_mm"),
    weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),

    isSerialTracked: boolean("is_serial_tracked").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("products_sku_unique").on(table.sku)]
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: warehouseTypeEnum("type").notNull().default("MAIN"),
    addressLine1: text("address_line_1"),
    suburb: text("suburb"),
    state: text("state"),
    postcode: text("postcode"),
    country: text("country").notNull().default("Australia"),
    managerUserId: text("manager_user_id").references(() => users.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("warehouses_code_unique").on(table.code)]
);

export const inventoryStock = pgTable(
  "inventory_stock",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    quantityReserved: integer("quantity_reserved").notNull().default(0),
    binLocation: text("bin_location"),
    lastCountedAt: timestamp("last_counted_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("inventory_stock_product_warehouse_unique").on(
      table.productId,
      table.warehouseId
    ),
  ]
);

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: text("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  movementType: stockMovementTypeEnum("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  performedByUserId: text("performed_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: text("id").primaryKey(),
    poNumber: text("po_number").notNull(),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    status: purchaseOrderStatusEnum("status").notNull().default("DRAFT"),
    orderedAt: date("ordered_at"),
    expectedAt: date("expected_at"),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("purchase_orders_po_number_unique").on(table.poNumber)]
);

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").notNull().default(0),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
