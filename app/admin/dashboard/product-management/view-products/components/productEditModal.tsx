"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Save, ChevronDown, ChevronUp, Plus, Tag } from "lucide-react";
// import { updateProduct, getCategories } from "../lib/products.service";
import { v4 as uuidv4 } from "uuid";
import { getCategories, updateProduct } from "../service/viewProductService";
import { Product, ProductCategory } from "@/app/types/productListTypes";
import {
  ProductVariantType,
  type ProductType,
} from "@/lib/validators/add-product-schema";
import Image from "next/image";
import {
  generateProductSKU,
  generateVariantSKU,
} from "../../add-product/utils/generateSKU";
import { formatNumber } from "@/utils/formatPrice";
import { fetchVariants } from "../../add-variants/service/variantServices";
import { Variants } from "../../add-variants/utils/variantTypes";

interface ProductEditModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  quantity: number;
  variantTypeId: string;
  values: string[];
};

// export type ProductVariantValue = {
//   variantValueId: string;
// };

// interface FormData {
//   name: string;
//   sku: string;
//   slug: string;
//   description: string;
//   tags: string;
//   price: string;
//   compare_at_price: string;
//   quantity: string;
//   track_quantity: boolean;
//   is_available: boolean;
//   active: boolean;
//   weight: string;
//   length: string;
//   width: string;
//   height: string;
//   url_handle: string;
//   meta_title: string;
//   meta_description: string;
// }

export function ProductEditModal({
  product,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<ProductType>({
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    tag: product.tag || [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    quantity: product.quantity,
    trackQuantity: product.trackQuantity,
    isAvailableForPurchase: product.isAvailableForPurchase,
    active: product.active,
    weight: product.weight,
    length: product.length,
    width: product.width,
    height: product.height,
    urlHandle: product.urlHandle,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  });
  const [newTag, setNewTag] = useState("");
  const [editvariants, setEditVariants] = useState<ProductVariant[]>(
    product.variants.map((item) => ({
      ...item,
      price: item.price ?? 0,
      variantTypeId: "",
      values: item.values.map((v) => v.variantValueId),
    }))
  );

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [variants, setVariant] = useState<Variants[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    basic: true,
    pricing: true,
    inventory: true,
    variants: false,
    images: false,
    categories: false,
    dimensions: false,
    seo: false,
  });

  useEffect(() => {
    loadCategories();
    async function loadVariant() {
      const data = await fetchVariants();
      setVariant(data);
    }
    loadVariant();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  const variantMap = useMemo(() => {
    const map: Record<string, Variants> = {};
    variants.forEach((v) => (map[v.id] = v));
    return map;
  }, [variants]);

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const addVariantGroup = () => {
    const newGroup: ProductVariant = {
      id: uuidv4(),
      price: 0,
      quantity: 0,
      sku: "",
      variantTypeId: "",
      values: [],
    };
    setEditVariants((prev) => [...prev, newGroup]);
  };

  const handleVariantChange = (
    groupId: string,
    field: keyof ProductVariant,
    value: string
  ) => {
    setEditVariants((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        if (field === "values") {
          return {
            ...group,
            values: [...group.values, value],
          };
        } else return { ...group, [field]: value };
      })
    );
  };

  const handleGenerateVariantSku = (
    productName: string,
    variantValuesIds: string[],
    groupId: string
  ) => {
    const valueName = variantValuesIds
      .map(
        (id) =>
          variants.flatMap((v) => v.values).find((val) => val.id === id)?.name
      )
      .filter((name): name is string => Boolean(name));

    console.log("valueName", valueName);

    const sku = generateVariantSKU(productName, valueName);
    console.log("🚀 ~ exactGroup ~ sku:", sku);

    setEditVariants((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, sku: sku } : group
      )
    );
  };

  const removeVariant = (groupId: string) => {
    setEditVariants((prev) => prev.filter((val) => val.id !== groupId));
  };

  const removeSelectedVariantValue = (groupId: string, valueId: string) => {
    setEditVariants((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, values: group.values.filter((id) => id !== valueId) }
          : group
      )
    );
  };

  function handleChange(field: keyof ProductType, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const currentTags = prev.tag || [];

      if (currentTags.includes(trimmed)) return prev;

      return {
        ...prev,
        tag: [...currentTags, trimmed],
      };
    });

    setNewTag("");
  };

  const handleGenerateProductSku = (productName: string) => {
    const SKU = generateProductSKU(productName);
    console.log("🚀 ~ handleGenerateSKU ~ SKU:", SKU);
    setFormData((prev) => {
      return { ...prev, sku: SKU };
    });
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag?.filter((tag) => tag !== tagToRemove),
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // const tags = product.tag
      //   // .split(",")
      //   .map((tag) => tag.trim())
      //   .filter(Boolean);

      await updateProduct(product.id, {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug,
        description: formData.description,
        tag: formData.tag,
        price: formData.price || 0,
        compare_at_price: formData.compareAtPrice || 0,
        quantity: formData.quantity || 0,
        track_quantity: formData.trackQuantity,
        is_available: formData.isAvailableForPurchase,
        active: formData.active,
        weight: formData.weight || 0,
        length: formData.length || 0,
        width: formData.width || 0,
        height: formData.height || 0,
        url_handle: formData.urlHandle,
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
      });

      onSave();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Section
              title="Basic Information"
              expanded={expandedSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    required
                  />
                  <button
                    disabled={!formData.name}
                    type="button"
                    onClick={() => handleGenerateProductSku(formData.name)}
                    className="bg-blue-600 text-white px-4 py-0.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200"
                  >
                    Generate SKU
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>

                  {formData.tag !== undefined && formData.tag.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tag.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                          <div
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </div>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    disabled={!formData.name}
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Pricing"
              expanded={expandedSections.pricing}
              onToggle={() => toggleSection("pricing")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      #
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare at Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      #
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onWheel={(e) => e.currentTarget.blur()}
                      value={formData.compareAtPrice}
                      onChange={(e) =>
                        handleChange("compareAtPrice", e.target.value)
                      }
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Inventory"
              expanded={expandedSections.inventory}
              onToggle={() => toggleSection("inventory")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) =>
                        handleChange("trackQuantity", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Track Quantity
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailableForPurchase}
                      onChange={(e) =>
                        handleChange("isAvailableForPurchase", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available for Purchase
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleChange("active", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                </div>
              </div>
            </Section>

            <Section
              title="Variants"
              expanded={expandedSections.variants}
              onToggle={() => toggleSection("variants")}
            >
              {/* <div className="text-sm text-gray-600">
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        {variant.values.map((val) => (
                          <div key={val.id}>
                            <div className="font-medium">{val.value}</div>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500">
                          SKU: {variant.sku} | Price: ${variant.price} |
                          Quantity: {variant.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No variants for this product</p>
                )}
              </div> */}
              <div>
                {/* <button
                  // onClick={addVariantGroup}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant Group
                </button> */}
                {editvariants.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No variants yet
                    </h3>
                    <p className="text-gray-500 mb-4 px-4">
                      Add variant groups like Size, Color, or Material to create
                      product options
                    </p>
                    <button
                      onClick={addVariantGroup}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Add First Variant Group
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button
                      onClick={addVariantGroup}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Add new variant
                    </button>
                    {editvariants.map((group) => {
                      const selectedVariant = variantMap[group.variantTypeId];

                      return (
                        <div
                          key={group.id}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                        >
                          {/* Variant Options Grid */}
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Variant Type *
                            </label>
                            <select
                              value={group.variantTypeId}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) =>
                                handleVariantChange(
                                  group.id,
                                  "variantTypeId",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">select variant type</option>
                              {variants?.map((variant) => (
                                <option value={variant.id} key={variant.id}>
                                  {variant.name}
                                </option>
                              ))}
                            </select>

                            {selectedVariant && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                  Value *
                                </label>

                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  onChange={(e) => {
                                    handleVariantChange(
                                      group.id,
                                      "values",
                                      e.target.value
                                    );
                                  }}
                                >
                                  <option value="">select a value</option>

                                  {selectedVariant?.values
                                    ?.filter(
                                      (v) => !group.values.includes(v.id)
                                    )
                                    .map((val) => (
                                      <option value={val.id} key={val.id}>
                                        {val.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}

                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Price *
                            </label>
                            <input
                              type="number"
                              value={group.price ? group.price : ""}
                              onChange={(e) =>
                                handleVariantChange(
                                  group.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                              step="0.01"
                            />
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              value={group.quantity || ""}
                              onChange={(e) =>
                                handleVariantChange(
                                  group.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Qty"
                            />

                            {/* working here */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                SKU *
                              </label>
                              <input
                                type="text"
                                value={group.sku}
                                onChange={(e) =>
                                  handleVariantChange(
                                    group.id,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="SKU-001"
                              />
                              <button
                                onClick={() =>
                                  handleGenerateVariantSku(
                                    formData.sku,
                                    group.values,
                                    group.id
                                  )
                                }
                                className="bg-blue-600 text-white px-4 py-0.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200"
                              >
                                Generate SKU
                              </button>
                              <p className="text-xs text-gray-500 mt-2">
                                Stock Keeping Unit - must be unique
                              </p>
                            </div>
                            <button
                              onClick={() => removeVariant(group.id)}
                              className="p-2 border border-red-800 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {/* ui to preview select variants */}
                            <div className="flex flex-wrap gap-2">
                              {group.values.map((valueId) => {
                                const value = variants
                                  .flatMap((v) => v.values)
                                  .find((val) => val.id === valueId);
                                return (
                                  <span
                                    key={valueId}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                                  >
                                    {value?.name}
                                    <button
                                      onClick={() =>
                                        removeSelectedVariantValue(
                                          group.id,
                                          valueId
                                        )
                                      }
                                      className="text-green-600 hover:text-green-800 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Images"
              expanded={expandedSections.images}
              onToggle={() => toggleSection("images")}
            >
              <div className="text-sm text-gray-600">
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <Image
                          src={image.url}
                          alt={image.altText || product.name}
                          className="w-full h-full object-cover"
                        />
                        {image.isPrimary && (
                          <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No images for this product</p>
                )}
              </div>
            </Section>

            <Section
              title="Categories"
              expanded={expandedSections.categories}
              onToggle={() => toggleSection("categories")}
            >
              <div className="text-sm text-gray-600">
                {product.categories && product.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No categories assigned</p>
                )}
              </div>
            </Section>

            <Section
              title="Dimensions"
              expanded={expandedSections.dimensions}
              onToggle={() => toggleSection("dimensions")}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleChange("length", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleChange("width", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="SEO / Metadata"
              expanded={expandedSections.seo}
              onToggle={() => toggleSection("seo")}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Handle
                  </label>
                  <input
                    type="text"
                    value={formData.urlHandle}
                    onChange={(e) => handleChange("urlHandle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleChange("metaDescription", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Section>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}
