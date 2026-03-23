"use client";
import { Product } from "@/app/types/productListTypes";
import { X, Edit, Package, Banknote, Tag, Ruler, Globe } from "lucide-react";
import Image from "next/image";
import { Category } from "@/app/types/categoryTypes";
import { formatNumber } from "@/utils/formatPrice";

import { useEffect, useState } from "react";
import { fetchVariants } from "../../add-variants/service/variantServices";
import { Variants } from "@/app/types/variantTypes";

interface ProductInfoModalProps {
  selectedProduct?: Product;
  onClose: () => void;
  onEdit: (selectedProduct: Product) => void;
  categories: Category[];
}

export function ProductInfoModal({
  selectedProduct,
  onClose,
  onEdit,
  categories,
}: ProductInfoModalProps) {
  const [variants, setVariant] = useState<Variants[]>([]);

  useEffect(() => {
    async function loadVariant() {
      const data = await fetchVariants();
      setVariant(data);
    }
    loadVariant();
  }, []);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  if (!selectedProduct) return null;

  const variantMap = new Map(
    variants.flatMap((v) => v.values.map((val) => [val.id, val.name]))
  );
  console.log("🚀 ~ variantMap:", variantMap);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(selectedProduct)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-8">
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedProduct.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || selectedProduct.name}
                        className="w-full h-full object-cover"
                        width="600"
                        height="600"
                      />
                      {image.isPrimary && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="mt-1 text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    SKU
                  </label>
                  <p className="mt-1 text-gray-900 font-mono">
                    {selectedProduct.sku}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Slug
                  </label>
                  <p className="mt-1 text-gray-900 font-mono">
                    {selectedProduct.slug}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProduct.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedProduct.active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {selectedProduct.description || "No description"}
                  </p>
                </div>
                {selectedProduct.tag && selectedProduct.tag.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Tags
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedProduct.tag.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Price
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    #{formatNumber(selectedProduct.price)}
                  </p>
                </div>
                {typeof selectedProduct?.compareAtPrice === "number" &&
                  selectedProduct?.compareAtPrice > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Compare at Price
                      </label>
                      <p className="mt-1 text-xl text-gray-600 line-through">
                        #{formatNumber(selectedProduct.compareAtPrice)}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Inventory
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Quantity
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {selectedProduct.quantity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Track Quantity
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProduct.trackQuantity
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedProduct.trackQuantity ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Available for Purchase
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProduct.isAvailableForPurchase
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProduct.isAvailableForPurchase ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedProduct?.variants?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Variants
                </h3>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-600">
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">
                          Date updatedAt
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedProduct.variants.map((variant) => {
                        const variantName = variant.values
                          ?.map((v) => variantMap.get(v.variantValueId))
                          .join(" / ");

                        return (
                          <tr key={variant.id} className="hover:bg-gray-50">
                            {/* Name */}
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {variantName}
                            </td>

                            {/* SKU */}
                            <td className="px-4 py-3 font-mono text-gray-700">
                              {variant.sku || "—"}
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3 text-gray-900">
                              {typeof variant.price === "number"
                                ? `₦${formatNumber(variant.price)}`
                                : "—"}
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3 text-gray-900">
                              {variant.quantity ?? 0}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  variant.isAvailableForPurchase
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {variant.isAvailableForPurchase
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            {/* UpdatedAt */}
                            <td className="px-4 py-3 text-gray-900">
                              {formatDate(variant.updatedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedProduct.categories &&
              selectedProduct.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
                      >
                        {categoryMap.get(category.categoryId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Dimensions
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Weight
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.weight} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Length
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.length} cm
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Width
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.width} cm
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Height
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.height} cm
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  SEO / Metadata
                </h3>
              </div>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    URL Handle
                  </label>
                  <p className="mt-1 text-gray-900 font-mono">
                    {selectedProduct.urlHandle || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Meta Title
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.metaTitle || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Meta Description
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedProduct.metaDescription || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Updated At
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedProduct.updatedAt)}
                  </p>
                </div>
                {selectedProduct.deletedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Deleted At
                    </label>
                    <p className="mt-1 text-sm text-red-600">
                      {formatDate(selectedProduct.deletedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
