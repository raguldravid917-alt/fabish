import React, { useState, useEffect } from 'react';
import { AlertTriangle, Truck, Package, Star, Link2, Building2, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { partnerService } from '../api/partnerService';

const ICON_MAP = {
  truck: Truck,
  package: Package,
  star: Star,
  link: Link2,
  building: Building2,
};

/* ── Skeleton ───────────────────────────────────────────────── */
const TypeSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-white border border-[#eae8d8] p-6 mb-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-64" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ── Dynamic Field Renderer ──────────────────────────────────── */
const DynamicField = ({ field, value, onChange, error }) => {
  const base = `w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${error ? 'border-red-400' : 'border-[#eae8d8]'}`;

  if (field.type === 'select') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${base} appearance-none cursor-pointer`} required={field.required}>
        <option value="">Select...</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      type={field.type || 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || ''}
      required={field.required}
      className={base}
    />
  );
};

const Partnership = () => {
  useDocumentTitle('Partnership - Fabish');
  const { showToast } = useToast();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState(1); // 1=select type, 2=fill form, 3=success
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Base form
  const [base, setBase] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    message: '',
  });
  const [baseErrors, setBaseErrors] = useState({});

  // Dynamic fields (keyed by field.key)
  const [dynValues, setDynValues] = useState({});
  const [dynErrors, setDynErrors] = useState({});

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await partnerService.getTypes();
        if (res.success) {
          setTypes(res.data || []);
        } else {
          setError(res.message || 'Failed to load partnership types');
        }
      } catch {
        setError('Could not connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleSelectType = (type) => {
    setSelectedType(type);
    // Initialize dynamic values
    const initVals = {};
    (type.fields || []).forEach((f) => { initVals[f.key] = ''; });
    setDynValues(initVals);
    setDynErrors({});
    setStep(2);
  };

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setBase((b) => ({ ...b, [name]: value }));
    if (baseErrors[name]) setBaseErrors((e) => ({ ...e, [name]: '' }));
  };

  const validateStep2 = () => {
    const errs = {};
    if (!base.businessName.trim()) errs.businessName = 'Required';
    if (!base.contactName.trim()) errs.contactName = 'Required';
    if (!base.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(base.email)) errs.email = 'Invalid email';

    const dErrs = {};
    (selectedType?.fields || []).forEach((f) => {
      if (f.required && !dynValues[f.key]?.trim()) {
        dErrs[f.key] = 'Required';
      }
    });

    setBaseErrors(errs);
    setDynErrors(dErrs);
    return Object.keys(errs).length === 0 && Object.keys(dErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const dynamicFields = Object.entries(dynValues).map(([key, value]) => {
      const field = selectedType.fields.find((f) => f.key === key);
      return { key, label: field?.label || key, value };
    });

    const payload = {
      type: selectedType.type,
      ...base,
      dynamicFields,
    };

    setSubmitting(true);
    try {
      const res = await partnerService.apply(payload);
      if (res.success) {
        setStep(3);
      } else {
        showToast(res.message || 'Submission failed. Please try again.', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Partnership' }];

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left">
      <PageBanner title="Partnership" breadcrumbs={breadcrumbs} />

      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16">

        {/* Step Indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span className={step >= 1 ? 'text-black' : ''}>1. Choose Type</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step >= 2 ? 'text-black' : ''}>2. Your Details</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step >= 3 ? 'text-black' : ''}>3. Confirmation</span>
          </div>
        )}

        {/* Step 1 — Type Selection */}
        {step === 1 && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-heading font-semibold text-black mb-2">Choose a Partnership Type</h2>
              <p className="text-sm text-gray-500">Select the type of partnership that best describes your interest with Fabish.</p>
            </div>

            {loading ? (
              <TypeSkeleton />
            ) : error ? (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-6">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {types.map((type) => {
                  const Icon = ICON_MAP[type.icon] || Building2;
                  return (
                    <button
                      key={type.type}
                      onClick={() => handleSelectType(type)}
                      className="w-full text-left bg-white border border-[#eae8d8] p-6 hover:border-[#8B5A2B] hover:shadow-sm transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#f0ede0] flex items-center justify-center group-hover:bg-[#8B5A2B] group-hover:text-white transition-colors flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-black mb-0.5">{type.label}</h3>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#8B5A2B] transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Step 2 — Application Form */}
        {step === 2 && selectedType && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black bg-transparent border-none cursor-pointer p-0"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <span className="text-gray-300">|</span>
              <h2 className="text-xl font-heading font-semibold text-black">{selectedType.label} Application</h2>
            </div>

            <div className="bg-white border border-[#eae8d8] p-8 md:p-12 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Base fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Business / Brand Name *</label>
                    <input name="businessName" value={base.businessName} onChange={handleBaseChange}
                      className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${baseErrors.businessName ? 'border-red-400' : 'border-[#eae8d8]'}`} />
                    {baseErrors.businessName && <p className="text-red-500 text-xs mt-1">{baseErrors.businessName}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Contact Name *</label>
                    <input name="contactName" value={base.contactName} onChange={handleBaseChange}
                      className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${baseErrors.contactName ? 'border-red-400' : 'border-[#eae8d8]'}`} />
                    {baseErrors.contactName && <p className="text-red-500 text-xs mt-1">{baseErrors.contactName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Email Address *</label>
                    <input type="email" name="email" value={base.email} onChange={handleBaseChange}
                      className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${baseErrors.email ? 'border-red-400' : 'border-[#eae8d8]'}`} />
                    {baseErrors.email && <p className="text-red-500 text-xs mt-1">{baseErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={base.phone} onChange={handleBaseChange}
                      className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Website / Portfolio URL</label>
                  <input type="url" name="website" value={base.website} onChange={handleBaseChange} placeholder="https://"
                    className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none" />
                </div>

                {/* Dynamic type-specific fields */}
                {selectedType.fields.length > 0 && (
                  <div className="pt-4 border-t border-[#eae8d8]">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5A2B] mb-6">{selectedType.label} Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedType.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">
                            {field.label} {field.required && '*'}
                          </label>
                          <DynamicField
                            field={field}
                            value={dynValues[field.key] || ''}
                            onChange={(val) => setDynValues((prev) => ({ ...prev, [field.key]: val }))}
                            error={dynErrors[field.key]}
                          />
                          {dynErrors[field.key] && <p className="text-red-500 text-xs mt-1">{dynErrors[field.key]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Additional Message</label>
                  <textarea name="message" value={base.message} onChange={handleBaseChange} rows={4} maxLength={3000}
                    placeholder="Tell us more about your goals and how you'd like to partner with Fabish..."
                    className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none resize-y" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-[#8B5A2B] text-white py-4 text-xs font-bold uppercase tracking-widest border-none cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="bg-white border border-[#eae8d8] p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-semibold text-black mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6 max-w-[480px] mx-auto">
              Thank you for your interest in a <strong>{selectedType?.label}</strong> partnership with Fabish.
              Our team will review your application and get back to you within 5–7 business days.
            </p>
            <button
              onClick={() => { setStep(1); setSelectedType(null); setBase({ businessName: '', contactName: '', email: '', phone: '', website: '', message: '' }); }}
              className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest border-none cursor-pointer hover:bg-[#8B5A2B] transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnership;
