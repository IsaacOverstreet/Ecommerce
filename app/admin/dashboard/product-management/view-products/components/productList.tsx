"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Filter, Eye, Edit, Power, PowerOff } from "lucide-react";
import {
  getCategories,
  getProducts,
  toggleProductStatus,
} from "../service/viewProductService";
import { ProductInfoModal } from "./productInfoModal";
import { ProductEditModal } from "./productEditModal";
import { Product, ProductMetaType } from "@/app/types/productListTypes";
import { ProductFilters } from "@/lib/validators/searchParams";
import { Category } from "@/app/types/categoryTypes";
import { logger } from "@/utils/logger";
import Image from "next/image";
import { formatNumber } from "@/utils/formatPrice";


interface allProductProp {
  productMeta: ProductMetaType;
}

export function ProductList({ productMeta }: allProductProp) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    page: 1,
    limit: 5,
    sortBy: "newest",
    stockStatus: "all",
    availability: "all",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // const pageNumber = useRef(filters.page);
  const [loadMore, setLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  const [clientFetchTotal, setClientFetchTotal] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts(filters);
      console.log("🚀 ~ loadProducts ~ products:", products);
      if (data === undefined) {
        throw new Error("Failed to load products");
      }
      setProducts(data.data);

      setClientFetchTotal(data.meta.total);
      console.log("clientFetchTotal", data.meta.total);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      logger.error("Failed to load categories:", error);
    }
  }
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  //TOGGLE PRODUCT STATUS
  async function handleToggleStatus(productId: string, currentStatus: boolean) {
    try {
      await toggleProductStatus(productId, !currentStatus);
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, active: !currentStatus } : p
        )
      );
    } catch (error) {
      logger.error("Failed to toggle product status:", error);
    }
  }

  async function getMoreProducts() {
    try {
      setLoadMore(true);
      console.log("🚀 ~ getMoreProducts ~ page:", page);
      const nextpage = page + 1;

      const newFilter = { ...filters, page: nextpage };

      console.log("🚀 ~ getMoreProducts ~ newFilter:", newFilter);

      setFilters(newFilter);

      const data = await getProducts(newFilter);

      if (data === undefined) {
        throw new Error("Failed to load products");
      }
      console.log("🚀 ~ getMoreProducts ~ data:", data.data);

      setProducts((prev) => [...prev, ...data.data]);
      setPage(nextpage);
      console.log("Products ", products);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoadMore(false);
    }
  }

  async function updateFilter<K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) {
    const newFilter: ProductFilters = {
      ...filters,
      [key]: value,
      page: 1,
    };
    setFilters(newFilter);
    setPage(newFilter.page);

    const data = await getProducts(newFilter);
    if (data === undefined) {
      throw new Error("Failed to load products");
    }
    setClientFetchTotal(data.meta.total);
    setProducts(data.data);
  }

  function handleSearch(search: string) {
    const newFilter: ProductFilters = {
      search,
      page: 1,
      limit: 2,
      sortBy: "newest",
      stockStatus: "all",
      availability: "all",
    };
    setFilters(newFilter);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    console.log("adhvjhdaddcad");
    searchTimeout.current = setTimeout(async () => {
      const data = await getProducts(newFilter);
      if (data === undefined) {
        throw new Error("Failed to load products");
      }
      setClientFetchTotal(data.meta.total);
      setProducts(data.data);
    }, 500);
  }

  function getPrimaryImage(product: Product): string {
    const primary = product.images?.find((img) => img.isPrimary);

    return primary?.url || product.images?.[0]?.url;
  }

  function getStockStatus(quantity: number): { label: string; color: string } {
    if (quantity === 0)
      return { label: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (quantity <= 10)
      return { label: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { label: "In Stock", color: "text-green-600 bg-green-50" };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>

          {/* Stats */}
          <div className="mb-6 mt-4 ">
            <div
              onClick={loadProducts}
              className="inline-flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm"
            >
              <div className="flex items-center justify-center  w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                📦
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Total Products
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {productMeta.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <select
                value={filters.sortBy || ""}
                onChange={(e) =>
                  updateFilter(
                    "sortBy",
                    e.target.value as ProductFilters["sortBy"]
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sort by...</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
              </select>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.categoryId || ""}
                    onChange={(e) =>
                      updateFilter(
                        "categoryId",
                        e.target.value as ProductFilters["categoryId"]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    value={filters.availability || "all"}
                    onChange={(e) =>
                      updateFilter(
                        "availability",
                        e.target.value as ProductFilters["availability"]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={filters.stockStatus || "all"}
                    onChange={(e) =>
                      updateFilter(
                        "stockStatus",
                        e.target.value as ProductFilters["stockStatus"]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : products?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products?.map((product) => {
                    const stockStatus = getStockStatus(product.quantity);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              width="300"
                              height="300"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.categories.map((cat) => (
                                <div
                                  key={cat.id}
                                  className="text-sm text-gray-500"
                                >
                                  {categoryMap.get(cat.categoryId) ||
                                    "Uncategorized"}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.sku}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{formatNumber(product.price)}
                          </div>
                          {product.compareAtPrice !== undefined && (
                            <div className="text-sm text-gray-500 line-through">
                              #{formatNumber(product.compareAtPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.quantity}
                          </div>
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(product.id, product.active)
                              }
                              className={`p-1 rounded transition-colors ${
                                product.active
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                              title={product.active ? "Disable" : "Enable"}
                            >
                              {product.active ? (
                                <PowerOff className="w-5 h-5" />
                              ) : (
                                <Power className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {/* View more (table footer style) */}
            {clientFetchTotal !== null && (
              <button
                className="w-[100%] border-t border flex flex-col border-slate-200 bg-slate-50"
                disabled={products.length >= clientFetchTotal}
                onClick={getMoreProducts}
              >
                <div className="flex items-center justify-center gap-2 py-5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition">
                  <span>{loadMore ? "Loading..." : "Load more products"}</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductInfoModal
          selectedProduct={selectedProduct}
          categories={categories}
        
          onClose={() => setSelectedProduct(null)}
          onEdit={(product) => {
            setSelectedProduct(null);
            setEditingProduct(product);
          }}
        />
      )}

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
