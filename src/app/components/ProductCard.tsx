import { Coffee } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  product: {
    id?: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    available: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border hover:scale-[1.03] group">
      <div className="relative h-56 bg-secondary overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold">
              غير متوفر حالياً
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {product.price} <span className="text-base">ج.م</span>
            </span>
          </div>
          
          {product.available && (
            <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
              متوفر
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
