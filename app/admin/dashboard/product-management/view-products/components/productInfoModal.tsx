import { X, Edit, Package, DollarSign, Tag, Ruler, Globe } from 'lucide-react';
import type { ProductWithRelations } from '../lib/database.types';

interface ProductInfoModalProps {
  product: ProductWithRelations;
  onClose: () => void;
  onEdit: (product: ProductWithRelations) => void;
}

export function ProductInfoModal({ product, onClose, onEdit }: ProductInfoModalProps) {
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
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
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {product.images.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={image.url}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                      {image.is_primary && (
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
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="mt-1 text-gray-900 font-mono">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Slug</label>
                  <p className="mt-1 text-gray-900 font-mono">{product.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{product.description || 'No description'}</p>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
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
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
                {product.compare_at_price > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Compare at Price</label>
                    <p className="mt-1 text-xl text-gray-600 line-through">${product.compare_at_price.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{product.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Track Quantity</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.track_quantity ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.track_quantity ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Available for Purchase</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variants</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">SKU</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {product.variants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{variant.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-mono">{variant.sku}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">${variant.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{variant.quantity}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              variant.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {variant.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {product.categories && product.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span key={category.id} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Dimensions</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Weight</label>
                  <p className="mt-1 text-gray-900">{product.weight} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Length</label>
                  <p className="mt-1 text-gray-900">{product.length} cm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Width</label>
                  <p className="mt-1 text-gray-900">{product.width} cm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Height</label>
                  <p className="mt-1 text-gray-900">{product.height} cm</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">SEO / Metadata</h3>
              </div>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">URL Handle</label>
                  <p className="mt-1 text-gray-900 font-mono">{product.url_handle || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Meta Title</label>
                  <p className="mt-1 text-gray-900">{product.meta_title || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Meta Description</label>
                  <p className="mt-1 text-gray-900">{product.meta_description || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                </div>
                {product.deleted_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deleted At</label>
                    <p className="mt-1 text-sm text-red-600">{formatDate(product.deleted_at)}</p>
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
