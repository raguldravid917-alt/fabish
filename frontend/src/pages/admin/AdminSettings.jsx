import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, BadgePercent, Truck, Mail } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminSettings = () => {
  useDocumentTitle('Admin - Settings');
  const { showToast } = useToast();
  
  // Settings states (Mocked/initialized from localStorage or defaults)
  const [storeName, setStoreName] = useState('Fabish Cosmetics Store');
  const [storeEmail, setStoreEmail] = useState('contact@fabish.com');
  const [shippingRate, setShippingRate] = useState('1000');
  const [taxPercent, setTaxPercent] = useState('18');
  const [sandbox, setSandbox] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Store settings saved successfully!', 'success');
    }, 800);
  };

  return (
    <div className="bg-white border border-[#eae8d8] p-8 md:p-14 max-w-3xl mx-auto shadow-sm select-none animate-fade-in">
      <div className="border-b border-[#eae8d8] pb-4 mb-8">
        <h3 className="serif-title text-2xl text-black uppercase font-medium tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#729855]" /> Store Configurations
        </h3>
        <p className="text-xs text-gray-400 mt-1">Configure shipping values, stripe gateways and templates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Store Name</label>
            <input 
              type="text" 
              required
              value={storeName} 
              onChange={(e) => setStoreName(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Support Contact Email</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={storeEmail} 
                onChange={(e) => setStoreEmail(e.target.value)} 
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] pl-10 pr-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#eae8d8] pt-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Free Shipping Threshold (Rs.)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                value={shippingRate} 
                onChange={(e) => setShippingRate(e.target.value)} 
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] pl-10 pr-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
              />
              <Truck className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Standard Order Tax (%)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                value={taxPercent} 
                onChange={(e) => setTaxPercent(e.target.value)} 
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] pl-10 pr-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
              />
              <BadgePercent className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Security Sandbox settings */}
        <div className="border-t border-[#eae8d8] pt-6 select-none">
          <div className="flex justify-between items-center bg-amber-50/50 border border-amber-100 p-4">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Gateway Sandbox Mode</h4>
                <p className="text-[10px] text-amber-700/80 mt-0.5 leading-relaxed">Forces simulated Stripe payments. Untick to initiate live token verification pools.</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={sandbox} 
              onChange={() => setSandbox(!sandbox)} 
              className="w-4 h-4 cursor-pointer accent-[#729855]"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving Parameters...' : 'Save Parameters'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
