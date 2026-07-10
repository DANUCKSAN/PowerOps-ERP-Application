import { asc } from "drizzle-orm";
import {
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UsersRound,
} from "lucide-react";

import { db } from "@/db";
import { products, purchaseOrders, suppliers } from "@/db/schema";
import { formatNumber } from "@/lib/inventory-display";

export const dynamic = "force-dynamic";

const formatAddress = (supplier: typeof suppliers.$inferSelect) =>
  [
    supplier.addressLine1,
    supplier.suburb,
    supplier.state,
    supplier.postcode,
    supplier.country,
  ]
    .filter(Boolean)
    .join(", ");

const getSupplierDetails = async () => {
  const [supplierRows, productRows, purchaseOrderRows] = await Promise.all([
    db.select().from(suppliers).orderBy(asc(suppliers.name)),
    db
      .select({
        id: products.id,
        supplierId: products.supplierId,
        status: products.status,
      })
      .from(products),
    db
      .select({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        status: purchaseOrders.status,
        expectedAt: purchaseOrders.expectedAt,
      })
      .from(purchaseOrders),
  ]);

  return supplierRows.map((supplier) => {
    const linkedProducts = productRows.filter(
      (product) => product.supplierId === supplier.id
    );
    const linkedPurchaseOrders = purchaseOrderRows.filter(
      (purchaseOrder) => purchaseOrder.supplierId === supplier.id
    );
    const openPurchaseOrders = linkedPurchaseOrders.filter((purchaseOrder) =>
      ["ORDERED", "PARTIALLY_RECEIVED"].includes(purchaseOrder.status)
    );

    return {
      ...supplier,
      productCount: linkedProducts.length,
      activeProductCount: linkedProducts.filter(
        (product) => product.status === "ACTIVE"
      ).length,
      purchaseOrderCount: linkedPurchaseOrders.length,
      openPurchaseOrderCount: openPurchaseOrders.length,
      nextExpectedAt:
        openPurchaseOrders
          .map((purchaseOrder) => purchaseOrder.expectedAt)
          .filter(Boolean)
          .sort()[0] ?? null,
    };
  });
};

const SuppliersPage = async () => {
  const supplierDetails = await getSupplierDetails();
  const activeSuppliers = supplierDetails.filter(
    (supplier) => supplier.isActive
  ).length;
  const totalProducts = supplierDetails.reduce(
    (total, supplier) => total + supplier.productCount,
    0
  );
  const openPurchaseOrders = supplierDetails.reduce(
    (total, supplier) => total + supplier.openPurchaseOrderCount,
    0
  );

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Procurement network</p>
          <h1 className="ops-page-title">Suppliers</h1>
          <p className="ops-page-description">
            Manage trade suppliers, preferred contacts, purchasing coverage,
            and replenishment relationships for PowerOps inventory.
          </p>
        </div>

        <div className="supplier-header-badge">
          <Truck className="size-4" />
          <span>{formatNumber(activeSuppliers)} active suppliers</span>
        </div>
      </div>

      <div className="ops-metric-grid">
        <div className="ops-metric-card">
          <span>Total suppliers</span>
          <strong>{formatNumber(supplierDetails.length)}</strong>
          <p>Approved supplier records in the ERP</p>
        </div>
        <div className="ops-metric-card">
          <span>Active suppliers</span>
          <strong>{formatNumber(activeSuppliers)}</strong>
          <p>Available for ordering and product linking</p>
        </div>
        <div className="ops-metric-card">
          <span>Linked products</span>
          <strong>{formatNumber(totalProducts)}</strong>
          <p>Products mapped to preferred suppliers</p>
        </div>
        <div className="ops-metric-card">
          <span>Open purchase orders</span>
          <strong>{formatNumber(openPurchaseOrders)}</strong>
          <p>Orders currently expected or partially received</p>
        </div>
      </div>

      <div className="supplier-card-grid">
        {supplierDetails.map((supplier) => {
          const address = formatAddress(supplier);

          return (
            <article key={supplier.id} className="supplier-card">
              <div className="supplier-card-top">
                <div className="supplier-card-icon">
                  <Building2 className="size-5" />
                </div>
                <span
                  className={
                    supplier.isActive
                      ? "supplier-status supplier-status-active"
                      : "supplier-status supplier-status-inactive"
                  }
                >
                  {supplier.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="supplier-card-main">
                <h2>{supplier.name}</h2>
                <p>{supplier.contactName ?? "No primary contact assigned"}</p>
              </div>

              <div className="supplier-contact-list">
                <div>
                  <Mail className="size-4" />
                  <span>{supplier.email ?? "No email set"}</span>
                </div>
                <div>
                  <Phone className="size-4" />
                  <span>{supplier.phone ?? "No phone set"}</span>
                </div>
                <div>
                  <MapPin className="size-4" />
                  <span>{address || "No address set"}</span>
                </div>
              </div>

              <div className="supplier-card-footer">
                <div>
                  <span>Products</span>
                  <strong>{formatNumber(supplier.productCount)}</strong>
                </div>
                <div>
                  <span>Open POs</span>
                  <strong>{formatNumber(supplier.openPurchaseOrderCount)}</strong>
                </div>
                <div>
                  <span>Next ETA</span>
                  <strong>{supplier.nextExpectedAt ?? "-"}</strong>
                </div>
              </div>

              {supplier.website && (
                <a
                  className="supplier-website-link"
                  href={supplier.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit supplier website
                  <ExternalLink className="size-4" />
                </a>
              )}
            </article>
          );
        })}
      </div>

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div>
            <h2>Supplier directory</h2>
            <p>Contact, product coverage, and purchasing status</p>
          </div>
          <UsersRound className="size-5 text-muted-foreground" />
        </div>

        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Products</th>
                <th>Purchase orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supplierDetails.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="ops-primary-cell">
                      <strong>{supplier.name}</strong>
                      <span>{supplier.website ?? "No website set"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ops-primary-cell">
                      <strong>{supplier.contactName ?? "Unassigned"}</strong>
                      <span>{supplier.email ?? supplier.phone ?? "-"}</span>
                    </div>
                  </td>
                  <td>{formatAddress(supplier) || "-"}</td>
                  <td>
                    <div className="supplier-table-stat">
                      <PackageSearch className="size-4" />
                      <span>
                        {formatNumber(supplier.activeProductCount)} active /{" "}
                        {formatNumber(supplier.productCount)} total
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="supplier-table-stat">
                      <ShoppingCart className="size-4" />
                      <span>
                        {formatNumber(supplier.openPurchaseOrderCount)} open /{" "}
                        {formatNumber(supplier.purchaseOrderCount)} total
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        supplier.isActive
                          ? "supplier-status supplier-status-active"
                          : "supplier-status supplier-status-inactive"
                      }
                    >
                      <ShieldCheck className="size-3.5" />
                      {supplier.isActive ? "Active" : "Inactive"}
                    </span>
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

export default SuppliersPage;
