import React, { useState, useEffect } from 'react';
import {
  X,
  PackagePlus,
  Edit3,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  Barcode,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Product, ProductFormData, ProductType, ProductVariant } from '../../types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  productToEdit?: Product | null;
}

const PRODUCT_TYPES: ProductType[] = [
  'Software',
  'Digital Service',
  'Add-on Component',
  'Usage Meter',
  'Physical Device',
  'Consulting',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [productType, setProductType] = useState<ProductType>('Software');
  const [salesPrice, setSalesPrice] = useState<string>('0');
  const [costPrice, setCostPrice] = useState<string>('0');
  const [description, setDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Errors & Touched
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // New variant inline editor state
  const [newVarName, setNewVarName] = useState('');
  const [newVarAddPrice, setNewVarAddPrice] = useState('0');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarStatus, setNewVarStatus] = useState<'available' | 'out_of_stock' | 'discontinued'>('available');
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [variantError, setVariantError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setProductType(productToEdit.productType);
      setSalesPrice(productToEdit.salesPrice.toString());
      setCostPrice(productToEdit.costPrice.toString());
      setDescription(productToEdit.description);
      setInternalNotes(productToEdit.internalNotes || '');
      setStatus(productToEdit.status);
      setVariants([...productToEdit.variants]);
    } else {
      setName('');
      setProductType('Software');
      setSalesPrice('49');
      setCostPrice('15');
      setDescription('');
      setInternalNotes('');
      setStatus('active');
      // Default initial standard variant
      setVariants([
        {
          id: `var-${Date.now()}-1`,
          name: 'Standard Edition',
          additionalPrice: 0,
          sku: 'SN-PROD-STD',
          availabilityStatus: 'available',
        },
      ]);
    }
    setErrors({});
    setTouched({});
    setShowAddVariant(false);
    setVariantError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const basePriceNum = parseFloat(salesPrice) || 0;
  const costPriceNum = parseFloat(costPrice) || 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters.';
    }

    if (!salesPrice.trim()) {
      newErrors.salesPrice = 'Sales price is required.';
    } else if (isNaN(Number(salesPrice)) || Number(salesPrice) <= 0) {
      newErrors.salesPrice = 'Sales price must be a valid positive number.';
    }

    if (costPrice.trim() !== '') {
      if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
        newErrors.costPrice = 'Cost price cannot be negative.';
      }
    }

    if (variants.length === 0) {
      newErrors.variants = 'At least one product variant is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleAddVariant = () => {
    if (!newVarName.trim()) {
      setVariantError('Variant name is required.');
      return;
    }
    const addPrice = parseFloat(newVarAddPrice);
    if (isNaN(addPrice) || addPrice < 0) {
      setVariantError('Additional price must be 0 or a positive number.');
      return;
    }

    const skuCode =
      newVarSku.trim() ||
      `SN-${name.slice(0, 4).toUpperCase() || 'VAR'}-${newVarName.slice(0, 3).toUpperCase()}-${Math.floor(
        Math.random() * 900 + 100
      )}`;

    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      name: newVarName.trim(),
      additionalPrice: addPrice,
      sku: skuCode,
      availabilityStatus: newVarStatus,
    };

    setVariants([...variants, newVariant]);
    setNewVarName('');
    setNewVarAddPrice('0');
    setNewVarSku('');
    setNewVarStatus('available');
    setShowAddVariant(false);
    setVariantError('');
    if (errors.variants) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.variants;
        return copy;
      });
    }
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      salesPrice: true,
      costPrice: true,
    });

    if (validate()) {
      onSubmit({
        name: name.trim(),
        productType,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice) || 0,
        description: description.trim(),
        internalNotes: internalNotes.trim(),
        status,
        variants,
      });
    }
  };

  const isEditing = !!productToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102B4E]">
                {isEditing ? 'Edit Product Configuration' : 'Add New Product'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? `Update catalog specifications for ${productToEdit.name}`
                  : 'Define a sellable item, base pricing, and configurable variants'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Product Name & Product Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Product Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Odoo Software Suite"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.name && errors.name
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.name && errors.name && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Product Type <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Row: Base Sales Price & Cost Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Base Sales Price ($) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  onBlur={() => handleBlur('salesPrice')}
                  placeholder="2000.00"
                  className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg text-slate-800 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                    touched.salesPrice && errors.salesPrice
                      ? 'border-[#EF4444] bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {touched.salesPrice && errors.salesPrice && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.salesPrice}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Cost Price ($) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  onBlur={() => handleBlur('costPrice')}
                  placeholder="650.00"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Unit Margin
              </label>
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] flex items-center justify-between">
                <span className="text-slate-400">Profit:</span>
                <span className="font-bold text-[#10B981]">
                  ${(basePriceNum - costPriceNum).toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                {basePriceNum > 0
                  ? `${Math.round(((basePriceNum - costPriceNum) / basePriceNum) * 100)}% margin`
                  : '0%'}
              </span>
            </div>
          </div>

          {/* Description & Internal Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Customer-Facing Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description displayed on invoices, quotations, and customer portals..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Internal Notes & Billing Instructions
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Private billing team notes, vendor references, licensing keys..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              />
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Catalog Status
            </label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 w-full sm:w-64">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  status === 'active'
                    ? 'bg-white text-[#10B981] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  status === 'inactive'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* PRODUCT VARIANTS SECTION */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-[#102B4E] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Product Variants ({variants.length})</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Each variant adds to the base sales price ({'$' + basePriceNum.toFixed(2)}) to determine the final calculated customer price.
                </p>
              </div>

              {!showAddVariant && (
                <button
                  type="button"
                  onClick={() => setShowAddVariant(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#102B4E] bg-[#102B4E]/10 hover:bg-[#102B4E]/15 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#10B981]" />
                  <span>Add Variant</span>
                </button>
              )}
            </div>

            {/* Existing Variants List */}
            <div className="space-y-2">
              {variants.map((v) => {
                const finalPrice = basePriceNum + v.additionalPrice;
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 sm:mt-0 font-mono text-[10px]">
                        #
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">{v.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 border border-slate-200 rounded">
                            {v.sku}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                              v.availabilityStatus === 'available'
                                ? 'bg-emerald-50 text-[#10B981]'
                                : v.availabilityStatus === 'out_of_stock'
                                ? 'bg-amber-50 text-[#F59E0B]'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {v.availabilityStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Base (${basePriceNum.toFixed(2)}) + Add (${v.additionalPrice.toFixed(2)})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-[#102B4E] tabular-nums">
                          ${finalPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">Calculated Final Price</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1 text-slate-400 hover:text-[#EF4444] rounded hover:bg-red-50 cursor-pointer"
                        title="Delete variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Variant Drawer / Subform */}
            {showAddVariant && (
              <div className="mt-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#102B4E] text-[11px]">
                    Configure New Variant
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddVariant(false);
                      setVariantError('');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Variant Name *
                    </label>
                    <input
                      type="text"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder="e.g. Enterprise Edition"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Additional Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVarAddPrice}
                      onChange={(e) => setNewVarAddPrice(e.target.value)}
                      placeholder="560.00"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      SKU Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={newVarSku}
                      onChange={(e) => setNewVarSku(e.target.value)}
                      placeholder="e.g. SN-ODOO-ENT"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">Availability:</span>
                    <select
                      value={newVarStatus}
                      onChange={(e) =>
                        setNewVarStatus(
                          e.target.value as 'available' | 'out_of_stock' | 'discontinued'
                        )
                      }
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddVariant(false);
                        setVariantError('');
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/50 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1 bg-[#102B4E] text-white rounded text-xs font-semibold hover:bg-[#183B6B]"
                    >
                      Save Variant
                    </button>
                  </div>
                </div>

                {variantError && (
                  <div className="text-[10px] text-[#EF4444] font-medium">{variantError}</div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? 'Save Product Changes' : 'Create Product Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
