import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Building,
  DollarSign,
  TrendingUp,
  Download,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Customer, CustomerFormData } from '../../types/customer';
import { INITIAL_CUSTOMERS } from '../../data/mockCustomers';
import { CustomerModal } from './CustomerModal';
import { CustomerProfileModal } from './CustomerProfileModal';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';

interface CustomersViewProps {
  onShowToast: (message: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onShowToast }) => {
  // Customers state initialized from localStorage or mock data
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_customers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading customers from localStorage', e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<Customer | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Sync to localStorage
  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    try {
      localStorage.setItem('subscriptnova_customers', JSON.stringify(newCustomers));
    } catch (e) {
      console.error('Error saving customers to localStorage', e);
    }
  };

  // Filter and search logic
  const filteredCustomers = customers.filter((c) => {
    const matchesFilter =
      statusFilter === 'all' ? true : c.status === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === 'active').length;
  const inactiveCount = customers.filter((c) => c.status === 'inactive').length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalRevenue, 0);

  // Handlers
  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleOpenProfile = (customer: Customer) => {
    setSelectedCustomerForProfile(customer);
    setIsProfileModalOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCustomer = (formData: CustomerFormData) => {
    if (customerToEdit) {
      // Edit existing
      const updated = customers.map((c) => {
        if (c.id === customerToEdit.id) {
          return {
            ...c,
            ...formData,
          };
        }
        return c;
      });
      saveCustomers(updated);
      onShowToast(`Updated customer details for ${formData.company}`);
      if (selectedCustomerForProfile && selectedCustomerForProfile.id === customerToEdit.id) {
        setSelectedCustomerForProfile({
          ...selectedCustomerForProfile,
          ...formData,
        });
      }
    } else {
      // Add new
      const newCust: Customer = {
        id: `cust-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
        subscriptionCount: 0,
        totalRevenue: 0.0,
        joinedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        billingAddress: formData.billingAddress,
        taxId: formData.taxId,
        subscriptions: [],
        invoices: [],
        payments: [],
      };
      saveCustomers([newCust, ...customers]);
      onShowToast(`Added new customer ${formData.company} (${formData.name})`);
    }

    setIsCustomerModalOpen(false);
    setCustomerToEdit(null);
  };

  const handleConfirmDelete = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    const updated = customers.filter((c) => c.id !== customerId);
    saveCustomers(updated);
    if (selectedCustomerForProfile?.id === customerId) {
      setIsProfileModalOpen(false);
      setSelectedCustomerForProfile(null);
    }
    onShowToast(`Deleted customer record for ${cust ? cust.company : 'account'}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D8B94]">
            <span className="w-2 h-2 rounded-full bg-[#1D8B94]" />
            <span>Master Account Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage subscriber accounts, credit histories, contacts, and billing lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'ID,Name,Email,Company,Phone,Status,Subscriptions,Total Revenue',
                  ...customers.map(
                    (c) =>
                      `"${c.id}","${c.name}","${c.email}","${c.company}","${c.phoneNumber}","${c.status}","${c.subscriptionCount}","${c.totalRevenue}"`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `subscriptnova_customers_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast('Exported customer records to CSV');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] active:bg-[#0A3D4A] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E2F4F0]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Accounts
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#04222B]/5 flex items-center justify-center text-[#04222B]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#04222B] tabular-nums mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Master customer entities</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Subscribers
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E2F4F0] flex items-center justify-center text-[#1D8B94]">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1D8B94] tabular-nums mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Math.round((activeCount / (totalCount || 1)) * 100)}% active account ratio
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inactive Accounts
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
            {inactiveCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero active subscriptions</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cumulative Revenue
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#04222B]/5 flex items-center justify-center text-[#04222B]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#04222B] tabular-nums mt-1">
            ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[#1D8B94] font-semibold font-mono mt-1">
            Avg ${(totalRevenue / (totalCount || 1)).toFixed(0)} / account
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filter & Search Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, or company..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Tabs: All | Active | Inactive */}
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#04222B] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white text-[#1D8B94] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Inactive ({inactiveCount})
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4 text-center">Subscriptions</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No customers found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? `No results matching "${searchQuery}". Try a different search.`
                        : 'No customer records in this view.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-3 text-xs font-semibold text-[#1D8B94] hover:underline"
                      >
                        Clear search query
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenProfile(customer)}
                  >
                    {/* Customer Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#04222B] text-[#4FB8B4] flex items-center justify-center font-bold text-[11px] shrink-0">
                          {customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {customer.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{customer.company}</div>
                      <div className="text-[10px] text-slate-400">ID: {customer.id}</div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {customer.phoneNumber}
                    </td>

                    {/* Subscription Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          customer.subscriptionCount > 0
                            ? 'bg-[#E2F4F0] text-[#0A3D4A]'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {customer.subscriptionCount}
                      </span>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#04222B] tabular-nums text-xs">
                      ${customer.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {customer.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D8B94]">
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

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenProfile(customer)}
                          title="View Profile"
                          className="p-1.5 text-slate-500 hover:text-[#1D8B94] hover:bg-[#E2F4F0]/60 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(customer)}
                          title="Edit Details"
                          className="p-1.5 text-slate-500 hover:text-[#1D8B94] hover:bg-[#E2F4F0]/60 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(customer)}
                          title="Delete Customer"
                          className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            Showing {filteredCustomers.length} of {customers.length} total customer accounts
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view complete billing history and subscriptions
          </span>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSubmit={handleSaveCustomer}
        customerToEdit={customerToEdit}
      />

      {/* View Customer Profile Modal */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedCustomerForProfile(null);
        }}
        customer={selectedCustomerForProfile}
        onEdit={(cust) => {
          setIsProfileModalOpen(false);
          handleOpenEdit(cust);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        customer={customerToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
