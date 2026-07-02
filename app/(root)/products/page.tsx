import { asc, eq } from "drizzle-orm";
import { PackageSearch, Search } from "lucide-react";

import { db } from "@/db";
import { inventoryStock, products, suppliers } from "@/db/schema";
import {
  formatCurrency,
  formatNumber,
  getAvailableQuantity,
  getStockBadgeClass,
  getStockStatus,
  productCategoryLabels,
  productStatusLabels,
  type ProductCategory,
} from "@/lib/inventory-display";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getParam = (
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) => {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
};

const productCategoryOptions = Object.entries(productCategoryLabels) as [
  ProductCategory,
  string,
][];

const getProductSpec = (product: typeof products.$inferSelect) => {
  if (product.category === "SOLAR_PANEL") {
    return `${product.powerRatingW ?? "-"}W, ${product.panelCellType ?? "cell type pending"}`;
  }

  if (product.category === "BATTERY") {
    return `${product.capacityKwh ?? "-"}kWh, ${product.batteryChemistry ?? "chemistry pending"}`;
  }

  if (product.category === "INVERTER") {
    return `${product.powerRatingW ?? "-"}W, ${product.phase ?? "phase pending"}`;
  }

  if (product.category === "EV_CHARGER") {
    return `${product.powerRatingW ?? "-"}W, ${product.evConnectorType ?? "connector pending"}`;
  }

  if (product.category === "HEAT_PUMP") {
    return `${product.heatPumpTankLitres ?? "-"}L tank`;
  }

  if (product.category === "CABLE") {
    return `${product.cableCoreSizeMm ?? "-"}mm2, ${product.voltage ?? "voltage pending"}`;
  }

  return product.dimensionsMm ?? product.ipRating ?? "General inventory item";
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const params = await searchParams;
  const query = getParam(params, "q")?.trim().toLowerCase() ?? "";
  const category = getParam(params, "category") as ProductCategory | undefined;

  const [productRows, stockRows] = await Promise.all([
    db
      .select({
        product: products,
        supplierName: suppliers.name,
      })
      .from(products)
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .orderBy(asc(products.category), asc(products.name)),
    db.select().from(inventoryStock),
  ]);

  const stockByProduct = new Map<
    string,
    { onHand: number; reserved: number; locations: number }
  >();

  for (const stock of stockRows) {
    const current = stockByProduct.get(stock.productId) ?? {
      onHand: 0,
      reserved: 0,
      locations: 0,
    };

    stockByProduct.set(stock.productId, {
      onHand: current.onHand + stock.quantityOnHand,
      reserved: current.reserved + stock.quantityReserved,
      locations: current.locations + 1,
    });
  }

  const rows = productRows
    .map((row) => {
      const stock = stockByProduct.get(row.product.id) ?? {
        onHand: 0,
        reserved: 0,
        locations: 0,
      };
      const available = getAvailableQuantity(stock.onHand, stock.reserved);
      const stockStatus = getStockStatus({
        available,
        reorderPoint: row.product.reorderPoint,
      });

      return {
        ...row,
        stock,
        available,
        stockStatus,
      };
    })
    .filter(({ product, supplierName }) => {
      const matchesCategory = category ? product.category === category : true;
      const searchable = [
        product.sku,
        product.name,
        product.brand,
        product.model,
        supplierName,
        productCategoryLabels[product.category],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (query ? searchable.includes(query) : true);
    });

  const totalProducts = productRows.length;
  const activeProducts = productRows.filter(
    ({ product }) => product.status === "ACTIVE"
  ).length;
  const lowStockProducts = rows.filter(
    ({ stockStatus }) => stockStatus === "Low stock" || stockStatus === "Out of stock"
  ).length;
  const catalogValue = rows.reduce(
    (total, { product, stock }) =>
      total + Number(product.averageCost) * stock.onHand,
    0
  );

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Product catalog</p>
          <h1 className="ops-page-title">Products</h1>
          <p className="ops-page-description">
            Production inventory records for solar, battery, EV charging, heat
            pump, mounting, cable, and electrical stock.
          </p>
        </div>
      </div>

      <div className="ops-metric-grid">
        <div className="ops-metric-card">
          <span>Total products</span>
          <strong>{formatNumber(totalProducts)}</strong>
          <p>Across all active inventory categories</p>
        </div>
        <div className="ops-metric-card">
          <span>Active products</span>
          <strong>{formatNumber(activeProducts)}</strong>
          <p>Available for warehouse operations</p>
        </div>
        <div className="ops-metric-card">
          <span>Needs attention</span>
          <strong>{formatNumber(lowStockProducts)}</strong>
          <p>Low or out-of-stock in current view</p>
        </div>
        <div className="ops-metric-card">
          <span>Stock value</span>
          <strong>{formatCurrency(catalogValue)}</strong>
          <p>Estimated from average cost and stock on hand</p>
        </div>
      </div>

      <form className="ops-toolbar">
        <label className="ops-search-field">
          <Search className="size-4" />
          <input
            name="q"
            placeholder="Search SKU, product, brand, supplier..."
            defaultValue={getParam(params, "q") ?? ""}
          />
        </label>

        <select
          name="category"
          className="ops-select"
          defaultValue={category ?? ""}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {productCategoryOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button className="ops-filter-button" type="submit">
          Apply filters
        </button>
      </form>

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div>
            <h2>Catalog records</h2>
            <p>{formatNumber(rows.length)} products in current view</p>
          </div>
          <PackageSearch className="size-5 text-muted-foreground" />
        </div>

        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Technical spec</th>
                <th>Supplier</th>
                <th>Available</th>
                <th>Reorder</th>
                <th>Avg cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, supplierName, stock, available, stockStatus }) => (
                <tr key={product.id}>
                  <td>
                    <div className="ops-primary-cell">
                      <strong>{product.name}</strong>
                      <span>
                        {product.sku} - {product.brand} {product.model}
                      </span>
                    </div>
                  </td>
                  <td>{productCategoryLabels[product.category]}</td>
                  <td>{getProductSpec(product)}</td>
                  <td>{supplierName ?? "Supplier pending"}</td>
                  <td>
                    <div className="ops-primary-cell">
                      <strong>
                        {formatNumber(available)} {product.unitOfMeasure}
                      </strong>
                      <span>
                        {formatNumber(stock.onHand)} on hand,{" "}
                        {formatNumber(stock.reserved)} reserved
                      </span>
                    </div>
                  </td>
                  <td>{formatNumber(product.reorderPoint)}</td>
                  <td>{formatCurrency(product.averageCost)}</td>
                  <td>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`ops-status-badge ${getStockBadgeClass(
                          stockStatus
                        )}`}
                      >
                        {stockStatus}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {productStatusLabels[product.status]}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
