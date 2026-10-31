import React from 'react';
import {
  X,
  Package,
  Layers,
  Edit3,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Tag,
  DollarSign,
  Info,
  Barcode,
} from 'lucide-react';
import { Product } from '../../types/product';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  const margin = product.salesPrice - product.costPrice;
  const marginPercent =
    product.salesPrice > 0 ? Math.round((margin / product.salesPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#04222B] text-[#4FB8B4] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#04222B] tracking-tight">
                  {product.name}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    product.status === 'active'
                      ? 'bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {product.status.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2F4F0]/60 text-[#0A3D4A] border border-[#98D8D0]/60">
                  {product.productType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Created {product.dateCreated}</span>
                <span>·</span>
                <span className="font-mono text-[11px] text-slate-400">ID: {product.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pricing Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-white border-b border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Base Sales Price
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#04222B] tabular-nums mt-0.5">
              ${product.salesPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Before variant add-ons</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Cost to Deliver
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-700 tabular-nums mt-0.5">
              ${product.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">COGS / unit</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Calculated Margin
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#1D8B94] tabular-nums mt-0.5">
              ${margin.toFixed(2)} ({marginPercent}%)
            </div>
            <div className="text-[10px] text-[#1D8B94] font-medium mt-0.5">Gross profit / sale</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Description & Notes */}
          <div className="space-y-3">
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                {product.description || 'No description provided for this product entry.'}
              </p>
            </div>

            {product.internalNotes && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Internal Notes & Instructions
                </h4>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-slate-700 text-xs">
                  {product.internalNotes}
                </div>
              </div>
            )}
          </div>

          {/* Variants Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#04222B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1D8B94]" />
                <span>Configured Product Variants ({product.variants.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula: Base Price + Variant Addition
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Variant Name</th>
                    <th className="py-2.5 px-3">SKU Code</th>
                    <th className="py-2.5 px-3 text-right">Base Price</th>
                    <th className="py-2.5 px-3 text-right">Additional</th>
                    <th className="py-2.5 px-3 text-right">Final Price</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.variants.map((variant) => {
                    const finalPrice = product.salesPrice + variant.additionalPrice;
                    return (
                      <tr key={variant.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-800">{variant.name}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {variant.sku}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                          ${product.salesPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                          +${variant.additionalPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#04222B] tabular-nums">
                          ${finalPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                              variant.availabilityStatus === 'available'
                                ? 'bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]'
                                : variant.availabilityStatus === 'out_of_stock'
                                ? 'bg-amber-50 text-[#F59E0B]'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {variant.availabilityStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Linked Subscriptions Protected Guard Status */}
          <div className="pt-2">
            {product.linkedSubscriptionsCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-[#E2F4F0]/60 border border-[#98D8D0]/80 flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#0A3D4A] shrink-0" />
                <div>
                  <div className="font-bold text-[#0A3D4A]">Subscription Protected Product</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Currently actively referenced by{' '}
                    <span className="font-semibold text-[#0A3D4A]">
                      {product.linkedSubscriptionsCount} active customer subscriptions
                    </span>
                    . Deletion is automatically locked to protect historical billing integrity.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1D8B94] shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">No Active Subscriptions Linked</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    This product is not linked to any active billing cycles and can be edited or removed safely.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            {product.variants.length} variant(s) · Margin {marginPercent}%
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
