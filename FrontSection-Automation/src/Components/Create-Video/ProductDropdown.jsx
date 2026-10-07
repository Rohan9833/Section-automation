import { useEffect, useState } from "react";

const API_BASE_URL = "/api";

const ProductDropdown = ({ value, onChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_BASE_URL);

        const result = await response.json();

        console.log("Products API Response:", result);

        if (!response.ok || !result.success) {
          throw new Error(result?.message || "Failed to fetch products");
        }

        setProducts(result.products || []);
      } catch (error) {
        console.error("Products API error:", error);

        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="mt-6 flex flex-col">
      {/* =========================
          LABEL
      ========================= */}

      <label className="mb-2 text-sm font-medium text-gray-800">
        Product Name <span className="text-orange-500">*</span>
      </label>

      {/* =========================
          SELECT
      ========================= */}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="h-11 w-full appearance-auto rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">
            {loading ? "Loading products..." : "Select product"}
          </option>

          {!loading &&
            products.map((product) => (
              <option key={product.slug} value={product.name}>
                {product.name}
              </option>
            ))}
        </select>

        {/* =========================
            LOADER
        ========================= */}

        {loading && (
          <span className="pointer-events-none absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
        )}
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* =========================
          HELP TEXT
      ========================= */}

      {!loading && !error && (
        <p className="mt-2 text-xs text-gray-400">
          Select the product for which you want to create the video.
        </p>
      )}
    </div>
  );
};

export default ProductDropdown;
