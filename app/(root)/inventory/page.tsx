import { desc, eq } from "drizzle-orm";
import { Activity, Boxes, Warehouse } from "lucide-react";

import { db } from "@/db";
import {
  inventoryStock,
  products,
  stockMovements,
  users,
  warehouses,
} from "@/db/schema";
import {
  formatCurrency,
  formatNumber,
  getAvailableQuantity,
  getStockBadgeClass,
  getStockStatus,
  productCategoryLabels,
  stockMovementTypeLabels,
  warehouseTypeLabels,
} from "@/lib/inventory-display";

export const dynamic = "force-dynamic";

const InventoryPage = async () => {
  const [stockRows, movementRows] = await Promise.all([
    db
      .select({
        stock: inventoryStock,
        product: products,
        warehouse: warehouses,
      })
      .from(inventoryStock)
      .innerJoin(products, eq(products.id, inventoryStock.productId))
      .innerJoin(warehouses, eq(warehouses.id, inventoryStock.warehouseId))
      .orderBy(warehouses.code, products.name),
    db
      .select({
        movement: stockMovements,
        productName: products.name,
        productSku: products.sku,
        warehouseCode: warehouses.code,
        performedByName: users.name,
      })
      .from(stockMovements)
      .innerJoin(products, eq(products.id, stockMovements.productId))
      .innerJoin(warehouses, eq(warehouses.id, stockMovements.warehouseId))
      .leftJoin(users, eq(users.id, stockMovements.performedByUserId))
      .orderBy(desc(stockMovements.createdAt))
      .limit(8),
  ]);

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

  const stockNeedingAttention = stockRows.filter((row) => {
    const available = getAvailableQuantity(
      row.stock.quantityOnHand,
      row.stock.quantityReserved
    );
    const status = getStockStatus({
      available,
      reorderPoint: row.product.reorderPoint,
    });

    return status !== "In stock";
  }).length;

  const warehouseSummaries = stockRows.reduce(
    (summary, row) => {
      const current = summary.get(row.warehouse.id) ?? {
        code: row.warehouse.code,
        name: row.warehouse.name,
        type: row.warehouse.type,
        products: 0,
        onHand: 0,
        reserved: 0,
        value: 0,
      };

      summary.set(row.warehouse.id, {
        ...current,
        products: current.products + 1,
        onHand: current.onHand + row.stock.quantityOnHand,
        reserved: current.reserved + row.stock.quantityReserved,
        value:
          current.value +
          Number(row.product.averageCost) * row.stock.quantityOnHand,
      });

      return summary;
    },
    new Map<
      string,
      {
        code: string;
        name: string;
        type: typeof warehouses.$inferSelect.type;
        products: number;
        onHand: number;
        reserved: number;
        value: number;
      }
    >()
  );

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Warehouse stock</p>
          <h1 className="ops-page-title">Inventory</h1>
          <p className="ops-page-description">
            Live stock position by warehouse, service van, and project holding
            location.
          </p>
        </div>
      </div>

      <div className="ops-metric-grid">
        <div className="ops-metric-card">
          <span>Available stock</span>
          <strong>{formatNumber(totalAvailable)}</strong>
          <p>{formatNumber(totalOnHand)} on hand across all locations</p>
        </div>
        <div className="ops-metric-card">
          <span>Reserved stock</span>
          <strong>{formatNumber(totalReserved)}</strong>
          <p>Allocated to installs, vans, or project work</p>
        </div>
        <div className="ops-metric-card">
          <span>Stock alerts</span>
          <strong>{formatNumber(stockNeedingAttention)}</strong>
          <p>Lines at or below reorder point</p>
        </div>
        <div className="ops-metric-card">
          <span>Inventory value</span>
          <strong>{formatCurrency(inventoryValue)}</strong>
          <p>Estimated current stock value</p>
        </div>
      </div>

      <div className="ops-grid-two">
        <div className="ops-table-card">
          <div className="ops-table-header">
            <div>
              <h2>Warehouse summary</h2>
              <p>Stock value and reservations by location</p>
            </div>
            <Warehouse className="size-5 text-muted-foreground" />
          </div>

          <div className="ops-stack-list">
            {[...warehouseSummaries.values()].map((warehouse) => {
              const available = getAvailableQuantity(
                warehouse.onHand,
                warehouse.reserved
              );

              return (
                <div className="ops-summary-row" key={warehouse.code}>
                  <div>
                    <strong>{warehouse.name}</strong>
                    <span>
                      {warehouse.code} - {warehouseTypeLabels[warehouse.type]}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong>{formatNumber(available)} available</strong>
                    <span>{formatCurrency(warehouse.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ops-table-card">
          <div className="ops-table-header">
            <div>
              <h2>Recent movements</h2>
              <p>Latest stock-changing events</p>
            </div>
            <Activity className="size-5 text-muted-foreground" />
          </div>

          <div className="ops-stack-list">
            {movementRows.map((row) => (
              <div className="ops-summary-row" key={row.movement.id}>
                <div>
                  <strong>
                    {stockMovementTypeLabels[row.movement.movementType]}
                  </strong>
                  <span>
                    {row.productSku} - {row.productName}
                  </span>
                  <span>{row.movement.reference ?? "No reference"}</span>
                </div>
                <div className="text-right">
                  <strong>
                    {row.movement.quantity > 0 ? "+" : ""}
                    {formatNumber(row.movement.quantity)}
                  </strong>
                  <span>{row.warehouseCode}</span>
                  <span>{row.performedByName ?? "System"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div>
            <h2>Stock by location</h2>
            <p>{formatNumber(stockRows.length)} product-location records</p>
          </div>
          <Boxes className="size-5 text-muted-foreground" />
        </div>

        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Location</th>
                <th>Category</th>
                <th>Bin</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Stock status</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row) => {
                const available = getAvailableQuantity(
                  row.stock.quantityOnHand,
                  row.stock.quantityReserved
                );
                const stockStatus = getStockStatus({
                  available,
                  reorderPoint: row.product.reorderPoint,
                });

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
                    <td>
                      <div className="ops-primary-cell">
                        <strong>{row.warehouse.code}</strong>
                        <span>{row.warehouse.name}</span>
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
                      <span
                        className={`ops-status-badge ${getStockBadgeClass(
                          stockStatus
                        )}`}
                      >
                        {stockStatus}
                      </span>
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

export default InventoryPage;
