import React, { useState, useEffect } from 'react';
import Loader from '../../components/ui/Loader';
import { Settings, Save, ShieldAlert, BadgePercent, Truck, Mail, FileText, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cmsService } from '../../api/cmsService';

const AdminSettings = () => {
  useDocumentTitle('Admin - Settings');
  const { showToast } = useToast();
  
  // Tab control: 'store' or 'cms'
  const [activeTab, setActiveTab] = useState('store');

  // Store Settings state
  const [storeName, setStoreName] = useState('Fabish Cosmetics Store');
  const [storeEmail, setStoreEmail] = useState('contact@fabish.com');
  const [shippingRate, setShippingRate] = useState('1000');
  const [taxPercent, setTaxPercent] = useState('18');
  const [sandbox, setSandbox] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);

  // CMS Settings state
  const [selectedSlug, setSelectedSlug] = useState('shipping-returns');
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsContent, setCmsContent] = useState('');
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsSaving, setCmsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch CMS page content on mount or slug change
  const fetchCmsPage = async (slug) => {
    setCmsLoading(true);
    try {
      const res = await cmsService.getPage(slug);
      if (res.success && res.data) {
        setCmsTitle(res.data.title);
        setCmsContent(res.data.content);
      } else {
        showToast('Failed to load page content', 'error');
      }
    } catch (err) {
      showToast('Error connecting to CMS service', 'error');
    } finally {
      setCmsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cms') {
      fetchCmsPage(selectedSlug);
    }
  }, [activeTab, selectedSlug]);

  const handleStoreSubmit = (e) => {
    e.preventDefault();
    setStoreLoading(true);
    setTimeout(() => {
      setStoreLoading(false);
      showToast('Store settings saved successfully!', 'success');
    }, 800);
  };

  const handleCmsSubmit = async (e) => {
    e.preventDefault();
    if (!cmsTitle.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    setCmsSaving(true);
    try {
      const res = await cmsService.updatePage(selectedSlug, {
        title: cmsTitle,
        content: cmsContent
      });
      if (res.success) {
        showToast('CMS Page updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update page', 'error');
      }
    } catch (err) {
      showToast('Connection error. Could not save page.', 'error');
    } finally {
      setCmsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#eae8d8] p-6 md:p-10 max-w-4xl mx-auto shadow-sm animate-fade-in text-left">
      {/* Title block */}
      <div className="border-b border-[#eae8d8] pb-4 mb-6">
        <h3 className="serif-title text-2xl text-black uppercase font-medium tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#729855]" /> Control Panel & Configurations
        </h3>
        <p className="text-xs text-gray-400 mt-1">Configure global store rules and dynamic CMS policy pages</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#eae8d8] mb-8 gap-4">
        <button
          onClick={() => setActiveTab('store')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 rounded-none bg-transparent cursor-pointer flex items-center gap-2 ${
            activeTab === 'store' 
              ? 'border-[#729855] text-[#2f3e10] font-black' 
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <Settings className="w-4 h-4" /> Store parameters
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 rounded-none bg-transparent cursor-pointer flex items-center gap-2 ${
            activeTab === 'cms' 
              ? 'border-[#729855] text-[#2f3e10] font-black' 
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <FileText className="w-4 h-4" /> Dynamic CMS pages
        </button>
      </div>

      {/* Store parameters form */}
      {activeTab === 'store' && (
        <form onSubmit={handleStoreSubmit} className="space-y-6">
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
          <div className="border-t border-[#eae8d8] pt-6">
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
            disabled={storeLoading}
            className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {storeLoading ? <Loader size="small" /> : 'Save Parameters'}
          </button>
        </form>
      )}

      {/* CMS Pages Form */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Select Page to Edit</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none cursor-pointer"
              >
                <option value="shipping-returns">Shipping & Returns</option>
                <option value="privacy-policy">Privacy Policy</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Page Title</label>
              <input
                type="text"
                required
                value={cmsTitle}
                onChange={(e) => setCmsTitle(e.target.value)}
                disabled={cmsLoading}
                placeholder="Enter page title"
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
              />
            </div>
          </div>

          {cmsLoading ? (
            <div className="py-20 flex justify-center">
              <Loader />
            </div>
          ) : (
            <form onSubmit={handleCmsSubmit} className="space-y-6 border-t border-[#eae8d8] pt-6">
              {/* Toggle Preview / Code */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer border ${
                    !previewMode 
                      ? 'bg-[#2f3e10] text-white border-[#2f3e10]' 
                      : 'bg-transparent text-gray-500 border-gray-300 hover:text-black'
                  }`}
                >
                  Edit HTML Code
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer border flex items-center gap-1 ${
                    previewMode 
                      ? 'bg-[#2f3e10] text-white border-[#2f3e10]' 
                      : 'bg-transparent text-gray-500 border-gray-300 hover:text-black'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Output
                </button>
              </div>

              {!previewMode ? (
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">HTML Content</label>
                  <textarea
                    rows={12}
                    value={cmsContent}
                    onChange={(e) => setCmsContent(e.target.value)}
                    placeholder="<h2>Write content in HTML format...</h2>"
                    className="w-full bg-[#fcfcfa] border border-[#eae8d8] p-4 font-mono text-xs text-black focus:outline-none focus:border-[#729855] rounded-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    Tip: You can use HTML tags like &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc. to format the text beautifully.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Page Preview</label>
                  <div className="bg-[#faf9f5] border border-[#eae8d8] p-6 max-h-[350px] overflow-y-auto prose max-w-none text-left text-sm">
                    {cmsContent ? (
                      <div dangerouslySetInnerHTML={{ __html: cmsContent }} />
                    ) : (
                      <p className="text-gray-400 italic">No content written yet.</p>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={cmsSaving}
                className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {cmsSaving ? <Loader size="small" /> : 'Publish CMS Changes'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
