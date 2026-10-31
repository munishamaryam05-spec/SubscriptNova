import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, AlertCircle, Building, Mail, Phone, MapPin, FileCheck } from 'lucide-react';
import { Customer, CustomerFormData } from '../../types/customer';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerToEdit,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    company: '',
    phoneNumber: '',
    status: 'active',
    billingAddress: '',
    taxId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name,
        email: customerToEdit.email,
        company: customerToEdit.company,
        phoneNumber: customerToEdit.phoneNumber,
        status: customerToEdit.status,
        billingAddress: customerToEdit.billingAddress || '',
        taxId: customerToEdit.taxId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        phoneNumber: '',
        status: 'active',
        billingAddress: '',
        taxId: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Contact name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid business email address.';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (formData.phoneNumber.trim().length < 7) {
      newErrors.phoneNumber = 'Phone number must be at least 7 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof CustomerFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      company: true,
      phoneNumber: true,
      billingAddress: true,
    });

    if (validate()) {
      onSubmit(formData);
    }
  };

  const isEditing = !!customerToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#04222B] text-[#4FB8B4] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#04222B]">
                {isEditing ? 'Edit Customer Details' : 'Add New Customer'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? `Update master record for ${customerToEdit.company}`
                  : 'Register a new business account into SubscriptNova'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Customer Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Primary Contact Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Dr. Aris Thorne"
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
                Company / Organization <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  onBlur={() => handleBlur('company')}
                  placeholder="e.g. Kallisto AI Corp"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                    touched.company && errors.company
                      ? 'border-[#EF4444] bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {touched.company && errors.company && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Billing Email <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur('email')}
                placeholder="billing@company.com"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.email && errors.email
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.email && errors.email && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="+1 (415) 890-2341"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.phoneNumber && errors.phoneNumber
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status & Tax ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Customer Status
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.status === 'active'
                      ? 'bg-white text-[#1D8B94] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'inactive' })}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.status === 'inactive'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tax Identification / VAT <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="e.g. US-942817482"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Billing Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="450 Mission Street, Suite 1200, San Francisco, CA 94105, USA"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94] resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Customer Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
