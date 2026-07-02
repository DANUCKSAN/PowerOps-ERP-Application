import type { products, stockMovements, warehouses } from "@/db/schema";

export type ProductCategory = typeof products.$inferSelect.category;
export type ProductStatus = typeof products.$inferSelect.status;
export type WarehouseType = typeof warehouses.$inferSelect.type;
export type StockMovementType = typeof stockMovements.$inferSelect.movementType;

export const productCategoryLabels: Record<ProductCategory, string> = {
  SOLAR_PANEL: "Solar Panel",
  BATTERY: "Battery",
  INVERTER: "Inverter",
  EV_CHARGER: "EV Charger",
  HEAT_PUMP: "Heat Pump",
  MOUNTING: "Mounting",
  CABLE: "Cable",
  ACCESSORY: "Accessory",
};

export const productStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DISCONTINUED: "Discontinued",
};

export const warehouseTypeLabels: Record<WarehouseType, string> = {
  MAIN: "Main Warehouse",
  SERVICE_VAN: "Service Van",
  PROJECT_SITE: "Project Site",
};

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  PURCHASE_RECEIVED: "Purchase received",
  MANUAL_ADJUSTMENT: "Manual adjustment",
  TRANSFER_IN: "Transfer in",
  TRANSFER_OUT: "Transfer out",
  PROJECT_ALLOCATION: "Project allocation",
  RETURNED_FROM_SITE: "Returned from site",
  DAMAGED: "Damaged",
};

export const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-AU").format(value ?? 0);

export const getAvailableQuantity = (onHand: number, reserved: number) =>
  Math.max(onHand - reserved, 0);

export const getStockStatus = ({
  available,
  reorderPoint,
}: {
  available: number;
  reorderPoint: number;
}) => {
  if (available <= 0) return "Out of stock";
  if (available <= reorderPoint) return "Low stock";
  return "In stock";
};

export const getStockBadgeClass = (status: string) => {
  if (status === "Out of stock") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Low stock") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};
