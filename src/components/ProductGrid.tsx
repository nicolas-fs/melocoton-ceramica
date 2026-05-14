"use client";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category?: string;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
      {products.map((product) => (
        <a
          key={product.id}
          href={/productos/}
          style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem", overflow: "hidden", textDecoration: "none", color: "inherit" }}
        >
          <img
            src={product.images[0] || "/placeholder.png"}
            alt={product.title}
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
          />
          <div style={{ padding: "1rem" }}>
            <h2 style={{ fontWeight: 600 }}>{product.title}</h2>
            <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#16a34a" }}>
              
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
