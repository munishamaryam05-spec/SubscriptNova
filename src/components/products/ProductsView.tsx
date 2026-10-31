import React, { useState } from 'react';
import {
  Package,
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Download,
  DollarSign,
  TrendingUp,
  Tag,
  Boxes,
  Barcode,
  Archive,
} from 'lucide-react';
import { Product, ProductFormData, ProductType } from '../../types/product';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';
import { ProductModal } from './ProductModal';
import { ProductDetailModal } from './ProductDetailModal';
import { DeleteProductDialog } from './DeleteProductDialog';

interface ProductsViewProps {
  onShowToast: (message: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ onShowToast }) => {
  // Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_products');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal management states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Sync to localStorage
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('subscriptnova_products', JSON.stringify(newProducts));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesType = typeFilter === 'all' ? true : p.productType === typeFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.variants.some(
        (v) =>
          v.name.toLowerCase().includes(query) || v.sku.toLowerCase().includes(query)
      );

    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate dynamic metrics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const inactiveProducts = products.filter((p) => p.status === 'inactive').length;
  const totalProductVariants = products.reduce((acc, p) => acc + p.variants.length, 0);

  // Handlers
  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProductForDetail(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveProduct = (formData: ProductFormData) => {
    if (productToEdit) {
      // Edit existing product
      const updated = products.map((p) => {
        if (p.id === productToEdit.id) {
          return {
            ...p,
            ...formData,
          };
        }
        return p;
      });
      saveProducts(updated);
      onShowToast(`Updated product specifications for ${formData.name}`);
      if (selectedProductForDetail && selectedProductForDetail.id === productToEdit.id) {
        setSelectedProductForDetail({
          ...selectedProductForDetail,
          ...formData,
        });
      }
    } else {
      // Add new product
      const newProd: Product = {
        id: `prod-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        productType: formData.productType,
        salesPrice: formData.salesPrice,
        costPrice: formData.costPrice,
        description: formData.description,
        internalNotes: formData.internalNotes,
        status: formData.status,
        variants: formData.variants,
        dateCreated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        linkedSubscriptionsCount: 0,
      };
      saveProducts([newProd, ...products]);
      onShowToast(`Created new catalog product ${formData.name} with ${formData.variants.length} variant(s)`);
    }

    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleConfirmDelete = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    saveProducts(updated);
    if (selectedProductForDetail?.id === productId) {
      setIsDetailModalOpen(false);
      setSelectedProductForDetail(null);
    }
    onShowToast(`Deleted ${target ? target.name : 'product'} from catalog`);
  };

  const handleMarkInactive = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, status: 'inactive' as const };
      }
      return p;
    });
    saveProducts(updated);
    onShowToast(`Product marked as inactive to protect active subscriptions`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Product Catalog & Service Units</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102B4E] mt-1 tracking-tight">
            Products & Variants
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure sellable products, tiered variants, SKU codes, and cost structures.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'ID,Name,Type,Sales Price,Cost Price,Variants Count,Status,Date Created',
                  ...products.map(
                    (p) =>
                      `"${p.id}","${p.name}","${p.productType}","${p.salesPrice}","${p.costPrice}","${p.variants.length}","${p.status}","${p.dateCreated}"`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `subscriptnova_products_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast('Exported product catalog to CSV');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Catalog</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] active:bg-[#0A1C33] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Strip (4 required metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Products
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            {totalProducts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Catalog items configured</div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Products
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981] tabular-nums mt-1">
            {activeProducts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for new subscriptions</div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inactive Products
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Archive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
            {inactiveProducts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Archived or paused entries</div>
        </div>

        {/* Total Product Variants */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Variants
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            {totalProductVariants}
          </div>
          <div className="text-[11px] text-[#10B981] font-semibold font-mono mt-1">
            Avg {(totalProductVariants / (totalProducts || 1)).toFixed(1)} variants / product
          </div>
        </div>
      </div>

      {/* 3. Products Table & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/40">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, description, SKU..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Filters: Type selector + Status selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Product Type Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#102B4E] cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Software">Software</option>
                <option value="Digital Service">Digital Service</option>
                <option value="Add-on Component">Add-on Component</option>
                <option value="Usage Meter">Usage Meter</option>
                <option value="Physical Device">Physical Device</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#102B4E] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({totalProducts})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white text-[#10B981] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Active ({activeProducts})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Inactive ({inactiveProducts})
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Product Type</th>
                <th className="py-3 px-4 text-right">Sales Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-center">Variants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No products found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try clearing active filters to see all catalog items.'
                        : 'No products configured in catalog yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(product)}
                  >
                    {/* Product Name & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {product.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Product Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {product.productType}
                      </span>
                    </td>

                    {/* Sales Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#102B4E] tabular-nums text-xs">
                      ${product.salesPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-500 tabular-nums text-xs">
                      ${product.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Number of Variants */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#102B4E]"
                        title={product.variants.map((v) => `${v.name} (+$${v.additionalPrice})`).join(', ')}
                      >
                        <Layers className="w-3 h-3 text-[#10B981]" />
                        <span>{product.variants.length}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {product.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Date Created */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {product.dateCreated}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(product)}
                          title="View Specifications & Variants"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Product & Variants"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(product)}
                          title={
                            product.linkedSubscriptionsCount > 0
                              ? `Locked: Linked to ${product.linkedSubscriptionsCount} active subscriptions`
                              : 'Delete Product'
                          }
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            product.linkedSubscriptionsCount > 0
                              ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-[#EF4444] hover:bg-red-50'
                          }`}
                        >
                          {product.linkedSubscriptionsCount > 0 ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="font-mono text-[11px]">
            Showing {filteredProducts.length} of {products.length} catalog products ({totalProductVariants} total variants)
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view calculated variant prices and subscription protection details
          </span>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProductForDetail(null);
        }}
        product={selectedProductForDetail}
        onEdit={(prod) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(prod);
        }}
      />

      {/* Delete / Guard Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onMarkInactive={handleMarkInactive}
      />
    </div>
  );
};
