import React from 'react'

interface ProductCardProps {
  name: string;
  brand: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  note: string;
}

const statusStyles: Record<ProductCardProps["status"], string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const ProductCard = ({name, brand, status, note }: ProductCardProps) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 flex flex-col">
     <h1 className="text-lg font-semibold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">Brand: {brand}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
          {status}
        </span>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
};      
   


export default ProductCard
