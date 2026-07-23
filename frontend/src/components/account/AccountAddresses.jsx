import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  Globe,
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AccountAddresses = ({
  addresses = [],
  isLoading = false,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    type: 'Home',
    isDefault: false
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      type: 'Home',
      isDefault: addresses.length === 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      street: addr.street || addr.addressLine1 || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || addr.postalCode || addr.pincode || '',
      country: addr.country || 'India',
      type: addr.type || 'Home',
      isDefault: !!addr.isDefault
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.street || !formData.city || !formData.zipCode) {
      showToast('Please complete all required address fields.', 'error');
      return;
    }

    if (editingAddress) {
      onEditAddress(editingAddress._id || editingAddress.id, formData);
    } else {
      onAddAddress(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Add Trigger */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
            Saved Delivery Addresses ({addresses.length})
          </h2>
          <p className="text-xs text-gray-500 font-body">Manage your default shipping destinations for 1-click checkout</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-10 px-5 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="font-heading font-bold text-base text-[#1C2415]">Delete Address?</h3>
            <p className="text-xs text-gray-500 font-body">Are you sure you want to remove this delivery address? This action cannot be undone.</p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E6D9] text-[#1C2415] text-xs font-heading font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAddress(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-heading font-bold border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E6D9] pb-4">
              <h3 className="font-heading font-extrabold text-base uppercase tracking-wider text-[#1C2415]">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9F5] flex items-center justify-center text-gray-500 hover:text-[#1C2415] border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                    placeholder="Recipient's full name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">Flat / House / Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                  placeholder="House number, building name, street"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full h-10 px-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs text-[#1C2415] outline-none focus:border-[#729855]"
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-bold text-[#1C2415]">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-[#729855] focus:ring-[#729855]"
                  />
                  Set as Default Shipping Address
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#E8E6D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-[#FAF9F5] border border-[#E8E6D9] text-[#1C2415] text-xs font-heading font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold border-none cursor-pointer transition-all shadow-xs"
                >
                  {editingAddress ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">No Saved Addresses</h3>
          <p className="text-xs text-gray-500 font-body max-w-sm mx-auto mb-6">
            Add a primary shipping address to enable fast, seamless 1-click checkout.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-6 py-3 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-widest transition-all shadow-xs border-none cursor-pointer"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            const isDefault = !!addr.isDefault;

            return (
              <div
                key={addrId}
                className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between relative transition-all ${
                  isDefault ? 'border-[#729855] ring-2 ring-[#729855]/20' : 'border-[#E8E6D9] hover:border-[#729855]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-sm text-[#1C2415]">
                        {addr.name}
                      </span>
                      {isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3E8] border border-[#D2E2C5] text-[#3A4D23] text-[10px] font-heading font-extrabold uppercase">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 font-body space-y-1 leading-relaxed">
                    <p>{addr.street || addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} - {addr.zipCode || addr.postalCode}</p>
                    <p>{addr.country || 'India'}</p>
                    <p className="pt-1 font-heading font-bold text-[#1C2415]">Phone: {addr.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-5 mt-4 border-t border-[#E8E6D9]">
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addrId)}
                      className="text-xs font-heading font-bold text-[#729855] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="h-8 px-3 rounded-xl bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(addrId)}
                      className="h-8 px-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-heading font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AccountAddresses;
