import { useState, useEffect } from "react";
import { X, Save, ChevronDown, ChevronUp } from "lucide-react";
// import { updateProduct, getCategories } from "../lib/products.service";
import type { ProductWithRelations, Category } from "../lib/database.types";
import { getCategories, updateProduct } from "../service/viewProductService";

interface ProductEditModalProps {
  product: ProductWithRelations;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  sku: string;
  slug: string;
  description: string;
  tags: string;
  price: string;
  compare_at_price: string;
  quantity: string;
  track_quantity: boolean;
  is_available: boolean;
  active: boolean;
  weight: string;
  length: string;
  width: string;
  height: string;
  url_handle: string;
  meta_title: string;
  meta_description: string;
}

export function ProductEditModal({
  product,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    tags: product.tags.join(", "),
    price: product.price.toString(),
    compare_at_price: product.compare_at_price.toString(),
    quantity: product.quantity.toString(),
    track_quantity: product.track_quantity,
    is_available: product.is_available,
    active: product.active,
    weight: product.weight.toString(),
    length: product.length.toString(),
    width: product.width.toString(),
    height: product.height.toString(),
    url_handle: product.url_handle,
    meta_title: product.meta_title,
    meta_description: product.meta_description,
  });

  const [categories, setCategories] = useState<Category[]>([]);
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
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function handleChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateProduct(product.id, {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug,
        description: formData.description,
        tags,
        price: parseFloat(formData.price) || 0,
        compare_at_price: parseFloat(formData.compare_at_price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        track_quantity: formData.track_quantity,
        is_available: formData.is_available,
        active: formData.active,
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        url_handle: formData.url_handle,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="Comma-separated tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
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
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) =>
                        handleChange("compare_at_price", e.target.value)
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
                      checked={formData.track_quantity}
                      onChange={(e) =>
                        handleChange("track_quantity", e.target.checked)
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
                      checked={formData.is_available}
                      onChange={(e) =>
                        handleChange("is_available", e.target.checked)
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
              <div className="text-sm text-gray-600">
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="font-medium">{variant.name}</div>
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
                        <img
                          src={image.url}
                          alt={image.alt_text || product.name}
                          className="w-full h-full object-cover"
                        />
                        {image.is_primary && (
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
                    value={formData.url_handle}
                    onChange={(e) => handleChange("url_handle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleChange("meta_title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) =>
                      handleChange("meta_description", e.target.value)
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
