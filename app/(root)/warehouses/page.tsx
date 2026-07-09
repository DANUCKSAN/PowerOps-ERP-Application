import { eq } from "drizzle-orm";
import {
  Boxes,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";

import { db } from "@/db";
import { inventoryStock, products, users, warehouses } from "@/db/schema";
import {
  formatCurrency,
  formatNumber,
  getAvailableQuantity,
  productCategoryLabels,
  warehouseTypeLabels,
} from "@/lib/inventory-display";

export const dynamic = "force-dynamic";

const smithfieldWarehouseCode = "SMF-MAIN";

const operatingProfile = {
  openTime: "7:00 AM",
  closeTime: "5:00 PM",
  days: "Monday to Friday",
  receivingCutoff: "3:30 PM",
};

const formatAddress = (warehouse: typeof warehouses.$inferSelect) =>
  [
    warehouse.addressLine1,
    warehouse.suburb,
    warehouse.state,
    warehouse.postcode,
    warehouse.country,
  ]
    .filter(Boolean)
    .join(", ");

const WarehousePage = async () => {
  const [warehouseRow] = await db
    .select({
      warehouse: warehouses,
      operatorName: users.name,
      operatorEmail: users.email,
    })
    .from(warehouses)
    .leftJoin(users, eq(users.id, warehouses.managerUserId))
    .where(eq(warehouses.code, smithfieldWarehouseCode))
    .limit(1);

  if (!warehouseRow) {
    return (
      <section className="ops-page">
        <div className="ops-empty-state">
          <Warehouse className="size-8" />
          <h1>Smithfield warehouse is not available</h1>
          <p>
            Seed or create the SMF-MAIN warehouse record to show warehouse
            operations here.
          </p>
        </div>
      </section>
    );
  }

  const stockRows = await db
    .select({
      stock: inventoryStock,
      product: products,
    })
    .from(inventoryStock)
    .innerJoin(products, eq(products.id, inventoryStock.productId))
    .where(eq(inventoryStock.warehouseId, warehouseRow.warehouse.id))
    .orderBy(products.name);

  const totalOnHand = stockRows.reduce(
    (total, row) => total + row.stock.quantityOnHand,
    0
  );
  const totalReserved = stockRows.reduce(
    (total, row) => total + row.stock.quantityReserved,
    0
  );
  const totalAvailable = getAvailableQuantity(totalOnHand, totalReserved);
  const inventoryValue = stockRows.reduce(
    (total, row) =>
      total + Number(row.product.averageCost) * row.stock.quantityOnHand,
    0
  );
  const categoryCount = new Set(stockRows.map((row) => row.product.category))
    .size;

  const address = formatAddress(warehouseRow.warehouse);

  return (
    <section className="ops-page warehouse-page">
      <div className="warehouse-hero">
        <div className="warehouse-hero-content">
          <div className="warehouse-hero-icon">
            <Warehouse className="size-6" />
          </div>
          <div>
            <p className="ops-eyebrow">Warehouse operations</p>
            <h1 className="ops-page-title">{warehouseRow.warehouse.name}</h1>
            <p className="ops-page-description">
              Smithfield receiving, storage, reservations, and dispatch view for
              PowerOps inventory.
            </p>
            <div className="warehouse-hero-meta">
              <span>{warehouseRow.warehouse.code}</span>
              <span>{warehouseTypeLabels[warehouseRow.warehouse.type]}</span>
              <span>
                {warehouseRow.warehouse.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="warehouse-hours-panel">
          <Clock3 className="size-5" />
          <span>Operating hours</span>
          <strong>
            {operatingProfile.openTime} - {operatingProfile.closeTime}
          </strong>
          <p>{operatingProfile.days}</p>
        </div>
      </div>

      <div className="warehouse-info-grid">
        <div className="warehouse-info-card">
          <div className="warehouse-info-icon">
            <Warehouse className="size-5" />
          </div>
          <span>Warehouse name</span>
          <strong>{warehouseRow.warehouse.name}</strong>
          <p>{warehouseRow.warehouse.code}</p>
        </div>

        <div className="warehouse-info-card">
          <div className="warehouse-info-icon">
            <MapPin className="size-5" />
          </div>
          <span>Warehouse location</span>
          <strong>
            {warehouseRow.warehouse.suburb}, {warehouseRow.warehouse.state}
          </strong>
          <p>{address}</p>
        </div>

        <div className="warehouse-info-card">
          <div className="warehouse-info-icon">
            <UserRound className="size-5" />
          </div>
          <span>Warehouse operator</span>
          <strong>{warehouseRow.operatorName ?? "Unassigned"}</strong>
          <p >{warehouseRow.operatorEmail ?? "No operator email set"}</p>
        </div>

        <div className="warehouse-info-card">
          <div className="warehouse-info-icon">
            <Clock3 className="size-5" />
          </div>
          <span>Open and closing time</span>
          <strong>
            {operatingProfile.openTime} - {operatingProfile.closeTime}
          </strong>
          <p>Receiving cutoff {operatingProfile.receivingCutoff}</p>
        </div>
      </div>

      <div className="ops-metric-grid">
        <div className="ops-metric-card">
          <span>Available stock</span>
          <strong>{formatNumber(totalAvailable)}</strong>
          <p>{formatNumber(totalOnHand)} units currently on hand</p>
        </div>
        <div className="ops-metric-card">
          <span>Reserved stock</span>
          <strong>{formatNumber(totalReserved)}</strong>
          <p>Allocated to active jobs and dispatch planning</p>
        </div>
        <div className="ops-metric-card">
          <span>Product lines</span>
          <strong>{formatNumber(stockRows.length)}</strong>
          <p>{formatNumber(categoryCount)} inventory categories stored</p>
        </div>
        <div className="ops-metric-card">
          <span>Stock value</span>
          <strong>{formatCurrency(inventoryValue)}</strong>
          <p>Estimated value based on average cost</p>
        </div>
      </div>

      <div className="ops-grid-two warehouse-operations-grid">
        <div className="ops-table-card">
          <div className="ops-table-header">
            <div>
              <h2>Warehouse readiness</h2>
              <p>Future-ready workflow blocks for Smithfield operations</p>
            </div>
            <ShieldCheck className="size-5 text-muted-foreground" />
          </div>

          <div className="warehouse-flow-list">
            <div className="warehouse-flow-item">
              <PackageCheck className="size-5" />
              <div>
                <strong>Receiving</strong>
                <span>Purchase order intake, bin allocation, and counts.</span>
              </div>
            </div>
            <div className="warehouse-flow-item">
              <Boxes className="size-5" />
              <div>
                <strong>Stock control</strong>
                <span>Reservations, cycle counts, and reorder visibility.</span>
              </div>
            </div>
            <div className="warehouse-flow-item">
              <Truck className="size-5" />
              <div>
                <strong>Dispatch</strong>
                <span>Install van loading, project staging, and handover.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ops-table-card warehouse-map-card">
          <div className="ops-table-header">
            <div>
              <h2>Location profile</h2>
              <p>{address}</p>
            </div>
            <MapPin className="size-5 text-muted-foreground" />
          </div>

          <div className="warehouse-map-visual">
            <div>
              <span>Primary depot</span>
              <strong>Smithfield, NSW</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div>
            <h2>Stock stored at Smithfield</h2>
            <p>{formatNumber(stockRows.length)} live product-location records</p>
          </div>
          <Boxes className="size-5 text-muted-foreground" />
        </div>

        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Bin</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row) => {
                const available = getAvailableQuantity(
                  row.stock.quantityOnHand,
                  row.stock.quantityReserved
                );

                return (
                  <tr key={row.stock.id}>
                    <td>
                      <div className="ops-primary-cell">
                        <strong>{row.product.name}</strong>
                        <span>
                          {row.product.sku} - {row.product.brand}
                        </span>
                      </div>
                    </td>
                    <td>{productCategoryLabels[row.product.category]}</td>
                    <td>{row.stock.binLocation ?? "-"}</td>
                    <td>{formatNumber(row.stock.quantityOnHand)}</td>
                    <td>{formatNumber(row.stock.quantityReserved)}</td>
                    <td>
                      {formatNumber(available)} {row.product.unitOfMeasure}
                    </td>
                    <td>
                      {formatCurrency(
                        Number(row.product.averageCost) *
                          row.stock.quantityOnHand
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default WarehousePage;
