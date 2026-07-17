import React, { useState, useEffect } from 'react';
import { productService } from '../../api/productService';
import {
  ArrowUp, ArrowDown, Trash2, Plus,
  HelpCircle, Eye, EyeOff, Save, Check, RefreshCw,
  Shield, Award, Star, Heart, Leaf, Zap, Clock, Tag,
  Package, RotateCcw, Lock, Droplets, Sun, Wind,
  ThumbsUp, CheckCircle, Truck, Sparkles, Smile,
  FlaskConical, Layers, Globe, Timer, AlarmClock,
  HandHeart, Beaker, Info
} from 'lucide-react';

// ── All available icon options for dropdowns ──────────────────────────────────
const ICON_OPTIONS = [
  'Star', 'Heart', 'Shield', 'Truck', 'Sparkles', 'Smile', 'Award', 'Info',
  'Leaf', 'Zap', 'Clock', 'Tag', 'Package', 'RotateCcw', 'Lock', 'Droplets',
  'Sun', 'Wind', 'ThumbsUp', 'CheckCircle', 'FlaskConical', 'Layers', 'Globe',
  'Timer', 'AlarmClock', 'HandHeart', 'Beaker', 'HelpCircle'
];

// ── Full section list (original + new) ───────────────────────────────────────
const defaultSections = [
  { sectionType: 'trustBadges',       label: 'Trust Badges' },
  { sectionType: 'offers',            label: 'Special Offers & Coupons' },
  { sectionType: 'highlights',        label: 'Product Highlights' },
  { sectionType: 'richDescription',   label: 'About This Product (Rich Description)' },
  { sectionType: 'benefits',          label: 'Key Benefits' },
  { sectionType: 'whyLoveIt',         label: 'Why You\'ll Love It' },
  { sectionType: 'certifications',    label: 'Certifications & Standards' },
  { sectionType: 'ingredients',       label: 'Ingredients / Materials' },
  { sectionType: 'activeIngredients', label: 'Active Ingredients' },
  { sectionType: 'usageSteps',        label: 'How To Use (Steps)' },
  { sectionType: 'skinType',          label: 'Skin Type' },
  { sectionType: 'suitableFor',       label: 'Suitable For' },
  { sectionType: 'specifications',    label: 'Product Specifications' },
  { sectionType: 'careInstructions',  label: 'Care Instructions' },
  { sectionType: 'care',              label: 'Care (Text Block)' },
  { sectionType: 'storage',           label: 'Storage Instructions' },
  { sectionType: 'shelfLife',         label: 'Shelf Life & Expiry' },
  { sectionType: 'countryOfOrigin',   label: 'Country of Origin' },
  { sectionType: 'faqs',              label: 'FAQ Section' },
  { sectionType: 'shipping',          label: 'Shipping Information' },
  { sectionType: 'returns',           label: 'Return Policy' },
  { sectionType: 'warranty',          label: 'Warranty Information' },
  { sectionType: 'safety',            label: 'Safety Information' },
  { sectionType: 'additional',        label: 'Additional Information' },
];

// Text section keys (stored as sectionType in ProductTextSection)
const TEXT_SECTION_KEYS = [
  { key: 'richDescription',   label: 'About This Product (Rich Description)' },
  { key: 'activeIngredients', label: 'Active Ingredients' },
  { key: 'skinType',          label: 'Skin Type' },
  { key: 'suitableFor',       label: 'Suitable For' },
  { key: 'countryOfOrigin',   label: 'Country of Origin' },
  { key: 'shelfLife',         label: 'Shelf Life & Expiry' },
  { key: 'care',              label: 'Care Instructions (Text Block)' },
  { key: 'shipping',          label: 'Shipping Information' },
  { key: 'returns',           label: 'Return Policy' },
  { key: 'warranty',          label: 'Warranty Details' },
  { key: 'storage',           label: 'Storage Instructions' },
  { key: 'safety',            label: 'Safety Guidelines' },
  { key: 'additional',        label: 'Additional Information' },
];

// ─────────────────────────────────────────────────────────────────────────────
const AdminProductContent = ({ product, products = [], onBack }) => {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);

  // List sections
  const [highlights, setHighlights] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [usageSteps, setUsageSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [fbt, setFbt] = useState([]);

  // New list sections
  const [certifications, setCertifications] = useState([]);
  const [trustBadges, setTrustBadges] = useState([]);
  const [offers, setOffers] = useState([]);
  const [whyLoveIt, setWhyLoveIt] = useState([]);
  const [careInstructions, setCareInstructions] = useState([]);

  // Text blocks (all keys in one object)
  const [textSections, setTextSections] = useState(
    Object.fromEntries(TEXT_SECTION_KEYS.map(k => [k.key, '']))
  );

  const [activeTab, setActiveTab] = useState('layout');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Add-form states
  const [newHighlight, setNewHighlight] = useState('');
  const [newBenefit, setNewBenefit] = useState({ title: '', description: '', icon: '' });
  const [newIngredient, setNewIngredient] = useState({ name: '', description: '' });
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newStep, setNewStep] = useState({ title: '', instruction: '' });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newCert, setNewCert] = useState({ name: '', icon: 'Award', description: '' });
  const [newBadge, setNewBadge] = useState({ title: '', icon: 'Shield' });
  const [newOffer, setNewOffer] = useState({ type: 'coupon', title: '', description: '', code: '', discountValue: '', validUntil: '', isActive: true });
  const [newWhyLove, setNewWhyLove] = useState({ icon: 'Heart', title: '', description: '' });
  const [newCare, setNewCare] = useState('');

  // ── Load Content ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const res = await productService.getContent(product._id);
        if (res.success && res.data) {
          const data = res.data;

          // Merge section configs
          if (data.configs && data.configs.length > 0) {
            const merged = defaultSections.map(def => {
              const dbConf = data.configs.find(c => c.sectionType === def.sectionType);
              return { ...def, isEnabled: dbConf ? dbConf.isEnabled : true, order: dbConf ? dbConf.order : 99 };
            });
            merged.sort((a, b) => a.order - b.order);
            setConfigs(merged);
          } else {
            setConfigs(defaultSections.map((s, idx) => ({ ...s, isEnabled: true, order: idx })));
          }

          setHighlights(data.highlights || []);
          setBenefits(data.benefits || []);
          setIngredients(data.ingredients || []);
          setSpecifications(data.specifications || []);
          setUsageSteps(data.usageSteps || []);
          setFaqs(data.faqs || []);
          setFbt(data.frequentlyBoughtTogether?.map(item => item.bundleProduct?._id || item.bundleProduct) || []);
          setCertifications(data.certifications || []);
          setTrustBadges(data.trustBadges || []);
          setOffers(data.offers || []);
          setWhyLoveIt(data.whyLoveIt || []);
          setCareInstructions(data.careInstructions || []);

          const texts = Object.fromEntries(TEXT_SECTION_KEYS.map(k => [k.key, '']));
          data.textSections?.forEach(ts => { if (texts.hasOwnProperty(ts.sectionType)) texts[ts.sectionType] = ts.content; });
          setTextSections(texts);
        }
      } catch (err) {
        console.error('Error loading product content:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    };
    loadContent();
  }, [product._id]);

  // ── Autosave ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialLoad || loading) return;
    setSaveStatus('Saving...');
    const timer = setTimeout(async () => {
      try {
        const payload = {
          configs: configs.map((c, index) => ({ sectionType: c.sectionType, isEnabled: c.isEnabled, order: index })),
          highlights,
          benefits,
          ingredients,
          specifications,
          usageSteps,
          faqs,
          textSections: Object.keys(textSections).map(key => ({ sectionType: key, content: textSections[key] })),
          frequentlyBoughtTogether: fbt,
          certifications,
          trustBadges,
          offers,
          whyLoveIt,
          careInstructions
        };
        const res = await productService.updateContent(product._id, payload);
        setSaveStatus(res.success ? 'Saved' : 'Error saving');
      } catch {
        setSaveStatus('Error saving');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    configs, highlights, benefits, ingredients, specifications, usageSteps,
    faqs, textSections, fbt, certifications, trustBadges, offers, whyLoveIt,
    careInstructions, isInitialLoad, loading, product._id
  ]);

  // ── Layout Controls ─────────────────────────────────────────────────────────
  const moveSection = (index, direction) => {
    const arr = [...configs];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setConfigs(arr);
  };

  const toggleSection = (index) => {
    const arr = [...configs];
    arr[index] = { ...arr[index], isEnabled: !arr[index].isEnabled };
    setConfigs(arr);
  };

  // ── Generic remove helper ───────────────────────────────────────────────────
  const removeItem = (list, setList, idx) => setList(list.filter((_, i) => i !== idx));

  // ── Add handlers ────────────────────────────────────────────────────────────
  const addHighlight = (e) => { e.preventDefault(); if (!newHighlight.trim()) return; setHighlights([...highlights, { text: newHighlight }]); setNewHighlight(''); };
  const addBenefit = (e) => { e.preventDefault(); if (!newBenefit.title.trim()) return; setBenefits([...benefits, newBenefit]); setNewBenefit({ title: '', description: '', icon: '' }); };
  const addIngredient = (e) => { e.preventDefault(); if (!newIngredient.name.trim()) return; setIngredients([...ingredients, newIngredient]); setNewIngredient({ name: '', description: '' }); };
  const addSpec = (e) => { e.preventDefault(); if (!newSpec.key.trim() || !newSpec.value.trim()) return; setSpecifications([...specifications, newSpec]); setNewSpec({ key: '', value: '' }); };
  const addStep = (e) => { e.preventDefault(); if (!newStep.instruction.trim()) return; setUsageSteps([...usageSteps, newStep]); setNewStep({ title: '', instruction: '' }); };
  const addFaq = (e) => { e.preventDefault(); if (!newFaq.question.trim() || !newFaq.answer.trim()) return; setFaqs([...faqs, newFaq]); setNewFaq({ question: '', answer: '' }); };
  const addCert = (e) => { e.preventDefault(); if (!newCert.name.trim()) return; setCertifications([...certifications, newCert]); setNewCert({ name: '', icon: 'Award', description: '' }); };
  const addBadge = (e) => { e.preventDefault(); if (!newBadge.title.trim()) return; setTrustBadges([...trustBadges, newBadge]); setNewBadge({ title: '', icon: 'Shield' }); };
  const addOffer = (e) => { e.preventDefault(); if (!newOffer.title.trim()) return; setOffers([...offers, { ...newOffer }]); setNewOffer({ type: 'coupon', title: '', description: '', code: '', discountValue: '', validUntil: '', isActive: true }); };
  const addWhyLove = (e) => { e.preventDefault(); if (!newWhyLove.title.trim()) return; setWhyLoveIt([...whyLoveIt, newWhyLove]); setNewWhyLove({ icon: 'Heart', title: '', description: '' }); };
  const addCare = (e) => { e.preventDefault(); if (!newCare.trim()) return; setCareInstructions([...careInstructions, { instruction: newCare }]); setNewCare(''); };
  const toggleFbt = (prodId) => setFbt(prev => prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]);
  const toggleOfferActive = (idx) => setOffers(offers.map((o, i) => i === idx ? { ...o, isActive: !o.isActive } : o));

  // ── UI Helpers ──────────────────────────────────────────────────────────────
  const InputCls = 'bg-[#fcfcfa] border border-[#eae8d8] px-3.5 py-2 text-sm text-black focus:outline-none focus:border-[#729855] w-full';
  const TextareaCls = `${InputCls} rounded-none`;
  const AddBtnCls = 'bg-[#2f3e10] hover:bg-black text-white px-4 py-2 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none';
  const CardCls = 'bg-[#fcfcfa] border border-[#eae8d8] p-4 flex justify-between items-start gap-3 text-sm';
  const SectionTitle = ({ children }) => <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black mb-3">{children}</h4>;
  const AddForm = ({ onSubmit, children }) => <form onSubmit={onSubmit} className="space-y-2 bg-[#fcfcfa] border border-[#eae8d8] p-4">{children}</form>;
  const IconSelect = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-white border border-[#eae8d8] px-2 py-2 text-xs font-semibold uppercase tracking-wider focus:outline-none cursor-pointer">
      <option value="">Select Icon</option>
      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
    </select>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
      <p>Loading Product Content settings...</p>
    </div>
  );

  const tabs = [
    { id: 'layout',   label: 'Layout & Ordering' },
    { id: 'highlights', label: 'Highlights & Specs' },
    { id: 'benefits', label: 'Benefits & Ingredients' },
    { id: 'usage',    label: 'How To Use & FAQs' },
    { id: 'trust',    label: 'Trust & Certifications' },
    { id: 'offers',   label: 'Offers & Coupons' },
    { id: 'extra',    label: 'Extra Content' },
    { id: 'text',     label: 'Policy & Info' },
    { id: 'bundle',   label: 'Bought Together' },
  ];

  return (
    <div className="bg-white border border-[#eae8d8] p-6 md:p-10 text-left">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#eae8d8] pb-4 mb-6 gap-4">
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855] block mb-1">Product Content Manager</span>
          <h3 className="serif-title text-xl text-black font-semibold uppercase">{product.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#fcfcfa] border border-[#eae8d8] px-3.5 py-1.5 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'Saving...' ? 'bg-amber-500 animate-pulse' : saveStatus === 'Saved' ? 'bg-[#729855]' : 'bg-red-500'}`} />
            <span>{saveStatus}</span>
          </div>
          <button onClick={onBack} className="text-gray-500 hover:text-black font-heading text-[10px] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer">← Back to Catalog</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#eae8d8] gap-5 text-xs font-heading font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap no-scrollbar pb-1 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-all cursor-pointer shrink-0 ${activeTab === tab.id ? 'border-[#729855] text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. Layout & Ordering ─────────────────────────────────────────────── */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-body">Enable/disable individual sections and reorder them. Only enabled sections with data will render on the product page.</p>
          <div className="border border-[#eae8d8] divide-y divide-[#eae8d8] bg-[#fcfcfa]">
            {configs.map((conf, index) => (
              <div key={conf.sectionType} className="flex items-center justify-between p-4 bg-white hover:bg-[#fcfcfa] transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSection(index)} className="cursor-pointer border-none bg-transparent" title={conf.isEnabled ? 'Disable Section' : 'Enable Section'}>
                    {conf.isEnabled ? <Eye className="w-4 h-4 text-[#729855]" /> : <EyeOff className="w-4 h-4 text-gray-300" />}
                  </button>
                  <span className={`text-sm font-semibold ${conf.isEnabled ? 'text-black' : 'text-gray-400 line-through'}`}>{conf.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button disabled={index === 0} onClick={() => moveSection(index, -1)} className="w-7 h-7 flex items-center justify-center border border-[#eae8d8] bg-white cursor-pointer disabled:opacity-30 hover:border-black">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button disabled={index === configs.length - 1} onClick={() => moveSection(index, 1)} className="w-7 h-7 flex items-center justify-center border border-[#eae8d8] bg-white cursor-pointer disabled:opacity-30 hover:border-black">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. Highlights & Specs ────────────────────────────────────────────── */}
      {activeTab === 'highlights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Highlights */}
          <div className="space-y-4">
            <SectionTitle>Bullet Highlights</SectionTitle>
            <form onSubmit={addHighlight} className="flex gap-2">
              <input type="text" placeholder="E.g., 100% Vegan and Organic certified" value={newHighlight} onChange={e => setNewHighlight(e.target.value)} className={InputCls} />
              <button type="submit" className={AddBtnCls}><Plus className="w-4 h-4" /> Add</button>
            </form>
            <div className="space-y-2">
              {highlights.length === 0 ? <p className="text-gray-400 text-xs italic">No highlights added yet.</p> : highlights.map((h, i) => (
                <div key={i} className={CardCls}>
                  <span className="text-[#333]">• {h.text}</span>
                  <button onClick={() => removeItem(highlights, setHighlights, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          {/* Specifications */}
          <div className="space-y-4">
            <SectionTitle>Technical Specifications</SectionTitle>
            <form onSubmit={addSpec} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" placeholder="Key (e.g. Volume)" value={newSpec.key} onChange={e => setNewSpec({ ...newSpec, key: e.target.value })} className={InputCls} />
              <div className="flex gap-2">
                <input type="text" placeholder="Value (e.g. 50 ml)" value={newSpec.value} onChange={e => setNewSpec({ ...newSpec, value: e.target.value })} className={InputCls} />
                <button type="submit" className={AddBtnCls}><Plus className="w-4 h-4" /> Add</button>
              </div>
            </form>
            <div className="space-y-2">
              {specifications.length === 0 ? <p className="text-gray-400 text-xs italic">No specifications added yet.</p> : specifications.map((s, i) => (
                <div key={i} className={CardCls}>
                  <span className="text-[#333] font-medium">{s.key}: <span className="font-normal text-gray-500">{s.value}</span></span>
                  <button onClick={() => removeItem(specifications, setSpecifications, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Benefits & Ingredients ────────────────────────────────────────── */}
      {activeTab === 'benefits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Key Benefits */}
          <div className="space-y-4">
            <SectionTitle>Key Product Benefits</SectionTitle>
            <AddForm onSubmit={addBenefit}>
              <input type="text" placeholder="Benefit Title (e.g., Deep Hydration)" value={newBenefit.title} onChange={e => setNewBenefit({ ...newBenefit, title: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm text-black focus:outline-none focus:border-[#729855] w-full" />
              <textarea placeholder="Description..." rows={2} value={newBenefit.description} onChange={e => setNewBenefit({ ...newBenefit, description: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm text-black focus:outline-none focus:border-[#729855] w-full rounded-none" />
              <div className="flex gap-2 items-center">
                <IconSelect value={newBenefit.icon} onChange={val => setNewBenefit({ ...newBenefit, icon: val })} />
                <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add</button>
              </div>
            </AddForm>
            <div className="space-y-2">
              {benefits.length === 0 ? <p className="text-gray-400 text-xs italic">No benefits added yet.</p> : benefits.map((b, i) => (
                <div key={i} className={CardCls}>
                  <div>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider flex items-center gap-2">
                      {b.icon && <span className="text-[#729855] text-[10px] bg-[#eae8d8]/30 px-1.5 py-0.5">{b.icon}</span>}
                      {b.title}
                    </span>
                    <p className="text-gray-500 text-xs mt-1">{b.description}</p>
                  </div>
                  <button onClick={() => removeItem(benefits, setBenefits, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          {/* Ingredients */}
          <div className="space-y-4">
            <SectionTitle>Ingredients & Materials</SectionTitle>
            <AddForm onSubmit={addIngredient}>
              <input type="text" placeholder="Ingredient (e.g. Hyaluronic Acid)" value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm text-black focus:outline-none focus:border-[#729855] w-full" />
              <textarea placeholder="Description/Percentage (optional)..." rows={2} value={newIngredient.description} onChange={e => setNewIngredient({ ...newIngredient, description: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm text-black focus:outline-none focus:border-[#729855] w-full rounded-none" />
              <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add</button>
            </AddForm>
            <div className="space-y-2">
              {ingredients.length === 0 ? <p className="text-gray-400 text-xs italic">No ingredients added yet.</p> : ingredients.map((ing, i) => (
                <div key={i} className={CardCls}>
                  <div>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider">{ing.name}</span>
                    {ing.description && <p className="text-gray-500 text-xs mt-1">{ing.description}</p>}
                  </div>
                  <button onClick={() => removeItem(ingredients, setIngredients, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. How To Use & FAQs ─────────────────────────────────────────────── */}
      {activeTab === 'usage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Usage Steps */}
          <div className="space-y-4">
            <SectionTitle>Usage Steps (How to Use)</SectionTitle>
            <AddForm onSubmit={addStep}>
              <input type="text" placeholder="Step Title (e.g., Step 1: Cleanse)" value={newStep.title} onChange={e => setNewStep({ ...newStep, title: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <textarea placeholder="Detailed instructions..." rows={3} value={newStep.instruction} onChange={e => setNewStep({ ...newStep, instruction: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full rounded-none" />
              <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add Step</button>
            </AddForm>
            <div className="space-y-2">
              {usageSteps.length === 0 ? <p className="text-gray-400 text-xs italic">No steps added yet.</p> : usageSteps.map((st, i) => (
                <div key={i} className={CardCls}>
                  <div>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider">Step {i + 1}: {st.title || 'Instruction'}</span>
                    <p className="text-gray-500 text-xs mt-1">{st.instruction}</p>
                  </div>
                  <button onClick={() => removeItem(usageSteps, setUsageSteps, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          {/* FAQs */}
          <div className="space-y-4">
            <SectionTitle>FAQ Questions & Answers</SectionTitle>
            <AddForm onSubmit={addFaq}>
              <input type="text" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <textarea placeholder="Detailed answer..." rows={3} value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full rounded-none" />
              <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add FAQ</button>
            </AddForm>
            <div className="space-y-2">
              {faqs.length === 0 ? <p className="text-gray-400 text-xs italic">No FAQs added yet.</p> : faqs.map((f, i) => (
                <div key={i} className={CardCls}>
                  <div className="max-w-[90%]">
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider flex items-start gap-1"><HelpCircle className="w-3.5 h-3.5 text-[#729855] shrink-0 mt-0.5" />{f.question}</span>
                    <p className="text-gray-500 text-xs mt-1">{f.answer}</p>
                  </div>
                  <button onClick={() => removeItem(faqs, setFaqs, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Trust & Certifications ────────────────────────────────────────── */}
      {activeTab === 'trust' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Certifications */}
          <div className="space-y-4">
            <SectionTitle>Certifications & Standards</SectionTitle>
            <p className="text-xs text-gray-500 font-body">E.g., Cruelty-Free, Organic, Dermatologist Tested, ISO Certified.</p>
            <AddForm onSubmit={addCert}>
              <input type="text" placeholder="Certification name (e.g. Cruelty-Free)" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <input type="text" placeholder="Short description (optional)" value={newCert.description} onChange={e => setNewCert({ ...newCert, description: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <div className="flex gap-2 items-center">
                <IconSelect value={newCert.icon} onChange={val => setNewCert({ ...newCert, icon: val })} />
                <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add</button>
              </div>
            </AddForm>
            <div className="space-y-2">
              {certifications.length === 0 ? <p className="text-gray-400 text-xs italic">No certifications added yet.</p> : certifications.map((c, i) => (
                <div key={i} className={CardCls}>
                  <div>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#729855] text-[10px] bg-[#eae8d8]/30 px-1.5 py-0.5">{c.icon}</span>
                      {c.name}
                    </span>
                    {c.description && <p className="text-gray-500 text-xs mt-1">{c.description}</p>}
                  </div>
                  <button onClick={() => removeItem(certifications, setCertifications, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          {/* Trust Badges */}
          <div className="space-y-4">
            <SectionTitle>Trust Badges</SectionTitle>
            <p className="text-xs text-gray-500 font-body">Short trust signals shown in a horizontal bar. E.g., "100% Organic", "Money-Back Guarantee", "Secure Checkout".</p>
            <AddForm onSubmit={addBadge}>
              <input type="text" placeholder="Badge label (e.g. Secure Checkout)" value={newBadge.title} onChange={e => setNewBadge({ ...newBadge, title: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <div className="flex gap-2 items-center">
                <IconSelect value={newBadge.icon} onChange={val => setNewBadge({ ...newBadge, icon: val })} />
                <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add</button>
              </div>
            </AddForm>
            <div className="space-y-2">
              {trustBadges.length === 0 ? <p className="text-gray-400 text-xs italic">No trust badges added yet.</p> : trustBadges.map((b, i) => (
                <div key={i} className={CardCls}>
                  <span className="font-heading font-bold text-xs text-black uppercase tracking-wider flex items-center gap-2">
                    <span className="text-[#729855] text-[10px] bg-[#eae8d8]/30 px-1.5 py-0.5">{b.icon}</span>
                    {b.title}
                  </span>
                  <button onClick={() => removeItem(trustBadges, setTrustBadges, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Offers & Coupons ──────────────────────────────────────────────── */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500 font-body">Create product-specific coupons, bundle deals, combo offers, and limited-time promotions. Only active offers render on the product page.</p>
          <AddForm onSubmit={addOffer}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={newOffer.type} onChange={e => setNewOffer({ ...newOffer, type: e.target.value })} className="bg-white border border-[#eae8d8] px-3 py-2 text-sm focus:outline-none focus:border-[#729855] cursor-pointer">
                <option value="coupon">Coupon</option>
                <option value="bundle">Bundle</option>
                <option value="combo">Combo</option>
                <option value="limited">Limited Time</option>
              </select>
              <input type="text" placeholder="Offer Title *" value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855]" />
              <input type="text" placeholder="Discount Value (e.g. ₹100 off / 10% off)" value={newOffer.discountValue} onChange={e => setNewOffer({ ...newOffer, discountValue: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855]" />
              <input type="text" placeholder="Coupon Code (optional)" value={newOffer.code} onChange={e => setNewOffer({ ...newOffer, code: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-[#729855]" />
              <input type="date" value={newOffer.validUntil} onChange={e => setNewOffer({ ...newOffer, validUntil: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855]" title="Valid Until (optional)" />
              <textarea placeholder="Description (optional)..." rows={2} value={newOffer.description} onChange={e => setNewOffer({ ...newOffer, description: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] rounded-none" />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                <input type="checkbox" checked={newOffer.isActive} onChange={e => setNewOffer({ ...newOffer, isActive: e.target.checked })} className="accent-[#729855] w-4 h-4" />
                Active (visible on product page)
              </label>
              <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add Offer</button>
            </div>
          </AddForm>

          <div className="space-y-3">
            {offers.length === 0 ? <p className="text-gray-400 text-xs italic">No offers added yet.</p> : offers.map((o, i) => (
              <div key={i} className={`${CardCls} ${!o.isActive ? 'opacity-60' : ''}`}>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${o.type === 'coupon' ? 'bg-[#729855] text-white' : o.type === 'bundle' ? 'bg-purple-500 text-white' : o.type === 'combo' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'}`}>{o.type}</span>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider">{o.title}</span>
                    {!o.isActive && <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 uppercase tracking-wider">Inactive</span>}
                  </div>
                  {o.discountValue && <p className="text-[#729855] text-xs font-bold">{o.discountValue}</p>}
                  {o.code && <p className="text-xs font-mono text-gray-500 mt-0.5">Code: <strong>{o.code}</strong></p>}
                  {o.description && <p className="text-xs text-gray-400 mt-0.5">{o.description}</p>}
                  {o.validUntil && <p className="text-[10px] text-gray-400 mt-0.5">Expires: {new Date(o.validUntil).toLocaleDateString('en-IN')}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleOfferActive(i)} title={o.isActive ? 'Deactivate' : 'Activate'} className="text-gray-400 hover:text-[#729855] bg-transparent border-none cursor-pointer">
                    {o.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => removeItem(offers, setOffers, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. Extra Content ─────────────────────────────────────────────────── */}
      {activeTab === 'extra' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Why You'll Love It */}
          <div className="space-y-4">
            <SectionTitle>Why You'll Love It</SectionTitle>
            <AddForm onSubmit={addWhyLove}>
              <input type="text" placeholder="Title (e.g. Lasts All Day)" value={newWhyLove.title} onChange={e => setNewWhyLove({ ...newWhyLove, title: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full" />
              <textarea placeholder="Description (optional)..." rows={2} value={newWhyLove.description} onChange={e => setNewWhyLove({ ...newWhyLove, description: e.target.value })} className="bg-white border border-[#eae8d8] px-3.5 py-2 text-sm focus:outline-none focus:border-[#729855] w-full rounded-none" />
              <div className="flex gap-2 items-center">
                <IconSelect value={newWhyLove.icon} onChange={val => setNewWhyLove({ ...newWhyLove, icon: val })} />
                <button type="submit" className={`${AddBtnCls} ml-auto`}><Plus className="w-4 h-4" /> Add</button>
              </div>
            </AddForm>
            <div className="space-y-2">
              {whyLoveIt.length === 0 ? <p className="text-gray-400 text-xs italic">No items added yet.</p> : whyLoveIt.map((w, i) => (
                <div key={i} className={CardCls}>
                  <div>
                    <span className="font-heading font-bold text-xs text-black uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#729855] text-[10px] bg-[#eae8d8]/30 px-1.5 py-0.5">{w.icon}</span>
                      {w.title}
                    </span>
                    {w.description && <p className="text-gray-500 text-xs mt-1">{w.description}</p>}
                  </div>
                  <button onClick={() => removeItem(whyLoveIt, setWhyLoveIt, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          {/* Care Instructions (list) */}
          <div className="space-y-4">
            <SectionTitle>Care Instructions (Bullet List)</SectionTitle>
            <p className="text-xs text-gray-500 font-body">Individual care bullets. For a full text block, use the Policy & Info tab → "Care Instructions (Text Block)".</p>
            <form onSubmit={addCare} className="flex gap-2">
              <input type="text" placeholder="E.g., Store below 30°C away from sunlight" value={newCare} onChange={e => setNewCare(e.target.value)} className={InputCls} />
              <button type="submit" className={AddBtnCls}><Plus className="w-4 h-4" /> Add</button>
            </form>
            <div className="space-y-2">
              {careInstructions.length === 0 ? <p className="text-gray-400 text-xs italic">No care instructions added yet.</p> : careInstructions.map((c, i) => (
                <div key={i} className={CardCls}>
                  <span className="text-[#333]">{c.instruction}</span>
                  <button onClick={() => removeItem(careInstructions, setCareInstructions, i)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Policy & Info (Text Blocks) ──────────────────────────────────── */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500 font-body">Rich text or plain text blocks for each policy/info section. Leaving a field blank will prevent that section from rendering on the product page.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEXT_SECTION_KEYS.map(sec => (
              <div key={sec.key} className="space-y-2">
                <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-black block">{sec.label}</label>
                <textarea
                  rows={4}
                  value={textSections[sec.key] || ''}
                  onChange={e => setTextSections({ ...textSections, [sec.key]: e.target.value })}
                  className={TextareaCls}
                  placeholder={`Details about ${sec.label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 9. Frequently Bought Together ───────────────────────────────────── */}
      {activeTab === 'bundle' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-body">Select products from the catalog to recommend as a bundle with this product.</p>
          <div className="border border-[#eae8d8] max-h-96 overflow-y-auto divide-y divide-[#eae8d8] bg-[#fcfcfa]">
            {products.filter(p => p._id !== product._id).map(prod => (
              <div key={prod._id} className="flex items-center justify-between p-4 bg-white hover:bg-[#fcfcfa]/50">
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={fbt.includes(prod._id)} onChange={() => toggleFbt(prod._id)} className="cursor-pointer accent-[#729855] w-4 h-4" />
                  <img src={prod.images?.[0]?.secure_url || prod.images?.[0] || '/assets/14.jpg'} alt="" className="w-10 h-12 object-cover border border-[#eae8d8]" />
                  <div>
                    <span className="text-sm font-semibold text-black block leading-snug">{prod.title}</span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{prod.category?.name || 'General'}</span>
                  </div>
                </div>
                <span className="font-heading font-bold text-sm text-black">Rs. {prod.price.toLocaleString('en-IN')}.00</span>
              </div>
            ))}
          </div>
          {fbt.length > 0 && (
            <p className="text-xs text-[#729855] font-bold">{fbt.length} product{fbt.length !== 1 ? 's' : ''} selected for the bundle.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductContent;
