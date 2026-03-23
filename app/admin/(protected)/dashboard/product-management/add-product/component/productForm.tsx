"use client";
import React, { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateProductSKU, generateVariantSKU } from "../utils/generateSKU";
import {
  Plus,
  X,
  Upload,
  Save,
  Eye,
  Package,
  Tag,
  Image as ImageIcon,
  Globe,
  Truck,
  BarChart3,
  Hash,
  Weight,
  Ruler,
  ShoppingCart,
  Star,
  Calendar,
  Eye as EyeIcon,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { Category } from "@/app/types/categoryTypes";
import { Variants } from "@/app/types/variantTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/app/admin/(protected)/dashboard/product-management/add-category/service/categoryServices";
import { fetchVariants } from "@/app/admin/(protected)/dashboard/product-management/add-variants/service/variantServices";
import { nanoid } from "nanoid";

import { publishProduct } from "../services/publishProduct";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Loading } from "@/components/shared-component/loading";
import SuccessCard from "@/components/shared-component/sucessCard";
import { useRouter } from "next/navigation";

interface ProductFormProp {
  initialCategories: Category[];
  initialVariants: Variants[];
}

interface ProductImage {
  id: string;
  file: File; // The selected file
  previewUrl: string; // URL.createObjectURL(file)
  isPrimary: boolean; // true if this is primary
}

type InputValue = string | number | boolean;

interface ProductVariant {
  id: string;
  price: number;
  quantity?: number;
  sku: string;
  variantTypeId: string;
  values: string[];
}

// interface ProductVariantGroup {
//   id: string;
//   name: string;
//   variants: ProductVariant[];
// }

const tabs = [
  { id: "general", label: "General", icon: Package },
  { id: "pricing", label: "Pricing", icon: Hash },
  { id: "inventory", label: "Inventory", icon: BarChart3 },
  { id: "variants", label: "Variants", icon: Tag },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "images", label: "Images", icon: ImageIcon },
];

export default function ProductForm({
  initialCategories,
  initialVariants,
}: ProductFormProp) {
  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    quantity: 0,
    trackQuantity: true,
    isAvailableForPurchase: true,
    active: true,
    sku: "",
    weight: 0, // in kg
    length: 0, // in cm
    width: 0, // in cm
    height: 0, // in cm
    tag: [] as string[],
    urlHandle: "",
    metaTitle: "",
    metaDescription: "",
  });
  const router = useRouter();
  const [images, setImages] = useState<ProductImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  const [newTag, setNewTag] = useState("");

  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const { ConfirmationDialog, confirm } = useConfirmation();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    initialData: initialCategories,
    staleTime: 60 * 1000,
  });

  const { data: variants } = useQuery({
    queryKey: ["variants"],
    queryFn: fetchVariants,
    initialData: initialVariants,
    staleTime: 60 * 1000,
  });

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id != id));
  };

  const handlePrimaryImageSelection = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id ? true : false,
      }))
    );
  };

  const handleInputChange = (field: string, value: InputValue) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //SELECT  IMAGE BUTTON
  const handleImageChooseButton = () => {
    fileInputRef.current?.click();
  };

  //ONCHANGE IMAGE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);

    if (!e.target.files) return;
    const selectedFiles: File[] = Array.from(e.target.files);

    // enforce max of 4 images
    if (images.length + selectedFiles.length > 8) {
      alert("You can only upload a maximum of 8 images");
      return;
    }

    // Map them to your ImageType structure
    const newImages: ProductImage[] = selectedFiles.map((file) => ({
      id: nanoid(),
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
    }));

    setImages((prev) => [...prev, ...newImages]); // append to state
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    handleInputChange("name", name);
    if (
      !productData.slug ||
      productData.slug === generateSlug(productData.name)
    ) {
      handleInputChange("slug", generateSlug(name));
    }
    if (
      !productData.urlHandle ||
      productData.urlHandle ===
        productData.name.toLowerCase().replace(/\s+/g, "-")
    ) {
      handleInputChange("urlHandle", generateSlug(name));
    }
    if (!productData.metaTitle || productData.metaTitle === productData.name) {
      handleInputChange("metaTitle", name);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tag.includes(newTag.trim())) {
      setProductData((prev) => ({
        ...prev,
        tag: [...prev.tag, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData((prev) => ({
      ...prev,
      tag: prev.tag.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const addVariantGroup = () => {
    const newGroup: ProductVariant = {
      id: uuidv4(),
      price: 0,
      quantity: 0,
      sku: "",
      variantTypeId: "",
      values: [],
    };
    setProductVariants((prev) => [...prev, newGroup]);
  };

  const handleGenerateProductSku = (productName: string) => {
    const SKU = generateProductSKU(productName);
    console.log("🚀 ~ handleGenerateSKU ~ SKU:", SKU);
    setProductData((prev) => {
      return { ...prev, sku: SKU };
    });
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

    setProductVariants((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, sku: sku } : group
      )
    );
  };

  const handleVariantChange = (
    groupId: string,
    field: keyof ProductVariant,
    value: string
  ) => {
    setProductVariants((prev) =>
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
    console.log("product", productVariants);
  };

  const variantMap = useMemo(() => {
    const map: Record<string, Variants> = {};
    variants.forEach((v) => (map[v.id] = v));
    return map;
  }, [variants]);

  const removeVariant = (groupId: string) => {
    setProductVariants((prev) => prev.filter((val) => val.id !== groupId));
  };

  const removeSelectedVariantValue = (groupId: string, valueId: string) => {
    setProductVariants((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, values: group.values.filter((id) => id !== valueId) }
          : group
      )
    );
  };

  const publish = () => {
    confirm({
      message: "Are you sure you want to save?",

      onConfirm: async () => {
        try {
          setLoading(true);
          setError(null); // reset previous error
          console.log("🚀 ~ onConfirm: ~ payload:");
          const payload = {
            productData,
            images,
            selectedCategories,
            productVariants,
          };
          console.log("🚀 ~ onConfirm: ~ payload:", payload);

          const res = await publishProduct(payload);
          router.refresh();
          setLoading(false);
          setShowSuccessCard(true);
          setSuccessMessage(res.message);

          console.log("🚀 Response:", res);
        } catch (err: unknown) {
          console.log("🚀 ~ onConfirm: ~ err:", err);
          setError(err as string);
          setLoading(false);
        }
      },
    });
  };

  const closeSuccessCard = () => {
    window.location.reload();
  };

  return (
    <div className="h-dvh bg-gray-50">
      <ConfirmationDialog />
      {showSuccessCard && (
        <SuccessCard message={successMessage} onClose={closeSuccessCard} />
      )}
      {/* ProgressBar */}
      {loading && <Loading />}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Create and manage your product catalog
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-wrap justify-end sm:justify-start items-center gap-2 sm:gap-3">
            {/* Hidden button, configure later if u want to add the feature */}
            <button
              hidden
              className="px-3 py-2 sm:px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm hover:shadow-md"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              hidden
              className="px-3 py-2 sm:px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            {/* End of hidden */}
            <button
              onClick={publish}
              disabled={loading}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl"
            >
              <Package className="w-4 h-4" />
              {loading ? "Creating..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className=" max-w-[100%]  h-dvh mx-auto px-6 py-8">
        <div className="flex flex-col  sm:flex-row gap-4">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 w-[100%] overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="overflow-x-auto">
                  <div className="flex space-x-6 px-6 min-w-max">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600 bg-white"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                <p className="text-xs text-red-700  mb-3">{error}</p>
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter product name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Product Slug *
                          </label>
                          <input
                            type="text"
                            disabled={!productData.name}
                            value={productData.slug}
                            onChange={(e) =>
                              handleInputChange("slug", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="product-slug"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Used for URLs and must be unique
                          </p>
                        </div>

                        <div className="w-[100%]">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            SKU *
                          </label>
                          <div className="w-[100%] flex gap-2">
                            <input
                              type="text"
                              value={productData.sku}
                              disabled={!productData.name}
                              onChange={(e) =>
                                handleInputChange("sku", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="SKU-001"
                            />
                            <button
                              disabled={
                                !productData.name ||
                                selectedCategories.length === 0
                              }
                              onClick={() =>
                                handleGenerateProductSku(productData.name)
                              }
                              className="bg-blue-600 text-white px-4 py-0.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200"
                            >
                              Generate SKU
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            Stock Keeping Unit - must be unique
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Categories
                          </label>
                          <div className="space-y-3">
                            <select
                              value=""
                              disabled={!productData.name}
                              onChange={(e) =>
                                e.target.value && addCategory(e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="">Select category to add</option>
                              {categories
                                .filter(
                                  (cat) => !selectedCategories.includes(cat.id)
                                )
                                .map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                            </select>

                            {selectedCategories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((categoryId) => {
                                  const category = categories.find(
                                    (c) => c.id === categoryId
                                  );
                                  return (
                                    <span
                                      key={categoryId}
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                                    >
                                      {category?.name}
                                      <button
                                        onClick={() =>
                                          removeCategory(categoryId)
                                        }
                                        className="text-green-600 hover:text-green-800 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Tags
                          </label>
                          <div className="space-y-3">
                            {productData.tag.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {productData.tag.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => removeTag(tag)}
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTag}
                                disabled={!productData.name}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Add tag"
                              />
                              <button
                                onClick={addTag}
                                disabled={!productData.name}
                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <textarea
                        value={productData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Detailed product description"
                      />
                    </div>
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className=" block text-sm font-semibold text-gray-700 mb-3">
                          Price *
                        </label>

                        <div className="relative">
                          <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={productData.price}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange("price", value);
                            }}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Price in naira: #{productData.price || "0"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Compare at Price
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            min={0}
                            type="number"
                            value={productData.compareAtPrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange("compareAtPrice", value);
                            }}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Original price before discount (optional)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Pricing Information
                        </h3>
                        <p className="text-blue-700 text-sm">
                          Prices are stored as decimal values in the database,
                          representing the exact amount in Naira. For example, a
                          product costing ₦1999.50 is stored as 1999.50. This
                          ensures accurate calculations and avoids rounding
                          errors.
                        </p>
                      </div>

                      {productData.compareAtPrice &&
                        Number(productData.compareAtPrice) >
                          Number(productData.price) && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                              Sale Price Active
                            </h3>
                            <p className="text-green-700 text-sm mb-3">
                              Customers will see the compare at price crossed
                              out with your sale price highlighted.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="line-through text-gray-500">
                                #{productData.compareAtPrice}
                              </span>
                              <span className="font-semibold text-green-600">
                                #{productData.price}
                              </span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {Math.round(
                                  ((productData.compareAtPrice -
                                    (productData.price || 0)) /
                                    productData.compareAtPrice) *
                                    100
                                )}
                                % OFF
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="trackQuantity"
                          checked={productData.trackQuantity}
                          onChange={(e) =>
                            handleInputChange("trackQuantity", e.target.checked)
                          }
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="trackQuantity"
                          className="text-sm font-medium text-gray-700"
                        >
                          Track inventory quantity
                        </label>
                      </div>
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {productData.trackQuantity && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Quantity in Stock
                          </label>
                          <input
                            type="number"
                            value={productData.quantity}
                            onChange={(e) =>
                              handleInputChange("quantity", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isAvailableForPurchase"
                            checked={productData.isAvailableForPurchase}
                            onChange={(e) =>
                              handleInputChange(
                                "isAvailableForPurchase",
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor="isAvailableForPurchase"
                            className="text-sm font-medium text-gray-700"
                          >
                            Available for purchase
                          </label>
                        </div>
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="active"
                            checked={productData.active}
                            onChange={(e) =>
                              handleInputChange("active", e.target.checked)
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor="active"
                            className="text-sm font-medium text-gray-700"
                          >
                            Product is active
                          </label>
                        </div>
                        {productData.active ? (
                          <EyeIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants Tab */}
                {activeTab === "variants" && (
                  <div className="space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Product Variants
                        </h3>
                        <p className="text-sm text-gray-500">
                          Manage different options like size, color, material
                        </p>
                      </div>
                      <button
                        onClick={addVariantGroup}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Variant Group
                      </button>
                    </div>

                    {/* No Variant Groups State */}
                    {productVariants.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No variants yet
                        </h3>
                        <p className="text-gray-500 mb-4 px-4">
                          Add variant groups like Size, Color, or Material to
                          create product options
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
                        {productVariants.map((group) => {
                          const selectedVariant =
                            variantMap[group.variantTypeId];

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
                                        productData.sku,
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
                )}

                {/* Shipping Tab */}
                {activeTab === "shipping" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Weight (kg)
                        </label>
                        <div className="relative">
                          <Weight className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={productData.weight}
                            onChange={(e) =>
                              handleInputChange("weight", e.target.value)
                            }
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="0.0"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="relative">
                            <Ruler className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={productData.length}
                              onChange={(e) =>
                                handleInputChange("length", e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Length"
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <Ruler className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={productData.width}
                              onChange={(e) =>
                                handleInputChange("width", e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Width"
                              step="0.1"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <Ruler className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={productData.height}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Height"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Used to calculate shipping rates accurately
                      </p>
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === "seo" && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={productData.metaTitle}
                        onChange={(e) =>
                          handleInputChange("metaTitle", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="SEO title for search engines"
                      />
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-2 gap-1">
                        <p className="text-xs text-gray-500">
                          Recommended: 50-60 characters
                        </p>
                        <p
                          className={`text-xs ${productData.metaTitle.length > 60 ? "text-red-500" : "text-gray-500"}`}
                        >
                          {productData.metaTitle.length}/60 characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Meta Description
                      </label>
                      <textarea
                        value={productData.metaDescription}
                        onChange={(e) =>
                          handleInputChange("metaDescription", e.target.value)
                        }
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Brief description for search engine results"
                      />
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-2 gap-1">
                        <p className="text-xs text-gray-500">
                          Recommended: 150-160 characters
                        </p>
                        <p
                          className={`text-xs ${productData.metaDescription.length > 160 ? "text-red-500" : "text-gray-500"}`}
                        >
                          {productData.metaDescription.length}/160 characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        URL Handle
                      </label>
                      <div className="flex flex-col md:flex-row">
                        <span className="px-4 py-3 bg-gray-100 border border-gray-300 border-b-0 md:border-b md:border-r-0 rounded-t-lg md:rounded-l-lg md:rounded-tr-none text-sm text-gray-600 font-medium text-center md:text-left">
                          /products/
                        </span>
                        <input
                          type="text"
                          value={productData.urlHandle}
                          onChange={(e) =>
                            handleInputChange("urlHandle", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-b-lg md:rounded-r-lg md:rounded-bl-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="product-url-handle"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This will be the products URL. Use lowercase letters,
                        numbers, and hyphens only.
                      </p>
                    </div>
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div className="space-y-8">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      <Upload className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4 md:mb-6" />

                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Upload Product Images
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Drag and drop your product images here, or click to
                        browse your files. High-quality images help increase
                        sales.
                      </p>
                      <button
                        onClick={handleImageChooseButton}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Choose Files
                      </button>
                      <p className="text-xs text-gray-500 mt-4">
                        Supports: JPG, PNG, WebP up to 10MB each. Recommended:
                        1200x1200px minimum
                      </p>
                    </div>

                    {images.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Uploaded Images
                        </h4>
                        <div className="space-y-4">
                          {/* Image grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {images.map((newImage) => (
                              <div
                                key={newImage.id}
                                onClick={() =>
                                  handlePrimaryImageSelection(newImage.id)
                                }
                                className={`
          relative group aspect-square rounded-lg overflow-hidden
          bg-gray-100 cursor-pointer transition-all duration-200
          border-2
          ${
            newImage.isPrimary
              ? "border-blue-600 ring-2 ring-blue-400"
              : "border-gray-200 hover:border-blue-300 hover:ring-1 hover:ring-blue-200"
          }
        `}
                              >
                                {/* Image */}
                                <Image
                                  src={URL.createObjectURL(newImage.file)}
                                  alt="Product preview"
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                  <button
                                    type="button"
                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 shadow-md"
                                    onClick={() =>
                                      handleRemoveImage(newImage.id)
                                    }
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Primary badge */}
                                {newImage.isPrimary && (
                                  <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full shadow">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Instruction text */}
                          <p className="text-sm text-gray-600">
                            Click an image to set it as the primary product
                            image.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}

          <div className="  w-full sm:w-[90%] md:w-[60%] lg:w-[40%] xl:w-[30%] space-y-6 mx-auto">
            {/* Product Status Card */}
            <div className="bg-white rounded-xl  shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Status
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      productData.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {productData.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Available for Purchase
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      productData.isAvailableForPurchase
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {productData.isAvailableForPurchase ? "Yes" : "No"}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created
                    </span>
                    <span className="text-gray-900 font-medium">
                      Not saved yet
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Updated
                    </span>
                    <span className="text-gray-900 font-medium">
                      Not saved yet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Stats
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Variants</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {productVariants.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Categories</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {selectedCategories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tags</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {productData.tag.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Images</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {images.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Pro Tips
                </h3>
              </div>

              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Use high-quality images (1200x1200px minimum) for better
                    conversions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Write detailed descriptions to improve SEO and customer
                    confidence
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Set accurate shipping dimensions to avoid delivery issues
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
