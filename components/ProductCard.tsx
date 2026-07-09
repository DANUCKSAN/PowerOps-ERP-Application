import { PackageCheck } from "lucide-react";

interface ProductCardProps {
  name: string;
  brand: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  note: string;
}

const statusStyles: Record<ProductCardProps["status"], string> = {
  "In Stock": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Low Stock": "border-amber-200 bg-amber-50 text-amber-700",
  "Out of Stock": "border-red-200 bg-red-50 text-red-700",
};

const ProductCard = ({ name, brand, status, note }: ProductCardProps) => {
  return (
    <article className="product-card">
      <div className="product-card-header">
        <div className="product-card-icon">
          <PackageCheck className="size-5" />
        </div>
        <span className={`product-status-badge ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      <div className="product-card-body">
        <h2>{name}</h2>
        <p>{brand}</p>
      </div>

      <p className="product-card-note">{note}</p>
    </article>
  );
};

export default ProductCard;
