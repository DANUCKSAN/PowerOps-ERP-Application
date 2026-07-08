import { asc } from "drizzle-orm";

import { db } from "@/db";
import { suppliers, warehouses } from "@/db/schema";
import AddProductDialog from "@/components/AddProductDialog";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "./action";

const ProductsPage = async () => {
  const [products, supplierRows, warehouseRows] = await Promise.all([
    getProducts(),
    db.select().from(suppliers).orderBy(asc(suppliers.name)),
    db.select().from(warehouses).orderBy(asc(warehouses.code)),
  ]);

  return (
    <section className="flex flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product master data, stock levels, and inventory items.
          </p>
        </div>

        <AddProductDialog
          suppliers={supplierRows.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
          }))}
          warehouses={warehouseRows.map((warehouse) => ({
            id: warehouse.id,
            code: warehouse.code,
            name: warehouse.name,
          }))}
        />
      </div>
      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by adding your first PowerOps product.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const stockStatus =
              product.status === "DISCONTINUED"
                ? "Out of Stock"
                : product.status === "INACTIVE"
                  ? "Low Stock"
                  : "In Stock";

            return (
              <ProductCard
                key={product.id}
                name={product.name}
                brand={product.brand}
                status={stockStatus}
                note={product.status}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
