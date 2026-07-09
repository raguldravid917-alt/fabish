import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Edit, Trash2, Search, ArrowUpDown, ChevronLeft, ChevronRight, Upload, X, ShieldAlert, ArrowLeft, ArrowRight, Star, AlertCircle, Eye, EyeOff, Save, Check } from 'lucide-react';
import Loader from '../../components/ui/Loader';
import { productService } from '../../api/productService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatPrice';
import { getLocalImageUrl } from '../../utils/imageMapper';

const AdminProducts = ({ products = [], categories = [], onRefresh }) => {
  useDocumentTitle('Admin - Products');
  const { showToast } = useToast();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null);

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState('titleAsc'); // titleAsc | titleDesc | priceAsc | priceDesc | stockLow
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('Published'); // Published | Draft | Hidden
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [variants, setVariants] = useState('');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [trending, setTrending] = useState(false);

  // Media Manager state
  const [existingImages, setExistingImages] = useState([]); // Kept images { secure_url, public_id, ... }
  const [stagedFiles, setStagedFiles] = useState([]); // Array of raw File objects
  const [stagedPreviews, setStagedPreviews] = useState([]); // Array of base64 preview objects { id, file, url, progress, status }

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Drag and drop dropzone ref
  const dropzoneRef = useRef(null);

  const resetForm = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setComparePrice('');
    setCategory(categories[0]?._id || categories[0]?.slug || '');
    setStock('10');
    setDescription('');
    setTags('');
    setStatus('Published');
    setMetaTitle('');
    setMetaDescription('');
    setVariants('');
    setFeatured(false);
    setBestSeller(false);
    setNewArrival(false);
    setTrending(false);
    setExistingImages([]);
    setStagedFiles([]);
    setStagedPreviews([]);
    setMessage('');
    setError('');
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setPrice(prod.price);
    setComparePrice(prod.comparePrice || '');
    // Category reference could be ObjectId or nested Category object
    setCategory(typeof prod.category === 'object' ? prod.category._id : prod.category);
    setStock(prod.stock);
    setDescription(prod.description);
    setTags(prod.tags?.join(', ') || '');
    setStatus(prod.status || 'Published');
    setMetaTitle(prod.seoTitle || '');
    setMetaDescription(prod.seoDescription || '');
    setVariants(prod.variants?.join(', ') || '');
    setFeatured(prod.featured || false);
    setBestSeller(prod.bestSeller || false);
    setNewArrival(prod.newArrival || false);
    setTrending(prod.trending || false);
    setExistingImages(prod.images || []);
    setStagedFiles([]);
    setStagedPreviews([]);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently? This will remove all files from Cloudinary and MongoDB.')) return;
    try {
      const result = await productService.delete(id);
      if (result.success) {
        showToast('Product and associated media deleted successfully', 'success');
        onRefresh?.();
      } else {
        showToast(result.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  // High Fidelity Media Upload Handlers
  const processFiles = (files) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const url = URL.createObjectURL(file);
      
      // Stage the raw file
      setStagedFiles(prev => [...prev, file]);
      
      // Stage preview with simulated progress
      const newPreview = { id, file, url, progress: 0, status: 'uploading' };
      setStagedPreviews(prev => [...prev, newPreview]);

      // Simulate Upload Progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 25) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setStagedPreviews(prev => 
            prev.map(p => p.id === id ? { ...p, progress: 100, status: 'ready' } : p)
          );
        } else {
          setStagedPreviews(prev => 
            prev.map(p => p.id === id ? { ...p, progress } : p)
          );
        }
      }, 200);
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Move staged file left
  const moveStagedLeft = (idx) => {
    if (idx === 0) return;
    setStagedPreviews(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
    setStagedFiles(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  // Move staged file right
  const moveStagedRight = (idx) => {
    if (idx === stagedPreviews.length - 1) return;
    setStagedPreviews(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
    setStagedFiles(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  // Set staging preview as primary (shifts to index 0)
  const setStagedPrimary = (idx) => {
    setStagedPreviews(prev => {
      const copy = [...prev];
      const target = copy.splice(idx, 1)[0];
      copy.unshift(target);
      return copy;
    });
    setStagedFiles(prev => {
      const copy = [...prev];
      const target = copy.splice(idx, 1)[0];
      copy.unshift(target);
      return copy;
    });
    showToast('Staged image marked as primary', 'success');
  };

  const removeStagedPreview = (id, idx) => {
    setStagedPreviews(prev => prev.filter(p => p.id !== id));
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle reordering / deletion of existing images
  const moveExistingLeft = (idx) => {
    if (idx === 0) return;
    setExistingImages(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const moveExistingRight = (idx) => {
    if (idx === existingImages.length - 1) return;
    setExistingImages(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  const setExistingPrimary = (idx) => {
    setExistingImages(prev => {
      const copy = [...prev];
      const target = copy.splice(idx, 1)[0];
      copy.unshift(target);
      return copy;
    });
    showToast('Existing image marked as primary', 'success');
  };

  const removeExistingImage = (publicId) => {
    setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
    showToast('Image scheduled for automatic purge on save', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!title.trim() || !price || !category || !description.trim()) {
      setError('Please fill out all required fields (Title, Price, Category, Description).');
      setLoading(false);
      return;
    }

    // Compile values into a FormData object
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('price', price);
    formData.append('comparePrice', comparePrice || '0');
    formData.append('category', category);
    formData.append('stock', stock || '0');
    formData.append('description', description.trim());
    formData.append('status', status);
    formData.append('tags', tags);
    formData.append('variants', variants);
    formData.append('seoTitle', metaTitle || title.trim());
    formData.append('seoDescription', metaDescription || description.trim().slice(0, 150));
    formData.append('featured', featured);
    formData.append('bestSeller', bestSeller);
    formData.append('newArrival', newArrival);
    formData.append('trending', trending);

    // Append newly uploaded files
    stagedFiles.forEach(file => {
      formData.append('images', file);
    });

    // Append remaining existing images as a JSON string
    formData.append('existingImages', JSON.stringify(existingImages));

    try {
      const result = editingProduct
        ? await productService.update(editingProduct._id, formData)
        : await productService.create(formData);

      setLoading(false);

      if (result.success) {
        showToast(editingProduct ? 'Product details updated successfully!' : 'Product created successfully!', 'success');
        resetForm();
        setView('list');
        onRefresh?.();
      } else {
        setError(result.message || 'Action failed.');
        showToast(result.message || 'Action failed.', 'error');
      }
    } catch (err) {
      setLoading(false);
      setError('A connection failure occurred. Verify parameters and retry.');
    }
  };

  // Bulk Actions Handlers
  const handleCheckboxToggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    const confirmText = `Are you sure you want to perform bulk ${action} on ${selectedIds.length} items?`;
    if (!window.confirm(confirmText)) return;

    try {
      let res;
      if (action === 'delete') {
        // Bulk delete on products
        const deletePromises = selectedIds.map(id => productService.delete(id));
        const results = await Promise.all(deletePromises);
        const failedCount = results.filter(r => !r.success).length;
        res = { success: failedCount === 0, message: failedCount > 0 ? `${failedCount} items failed to delete` : '' };
      } else {
        // Bulk Draft / Bulk Publish status updates
        // Let's call patchStatus iteratively or bulk status endpoint
        const statusVal = action === 'publish' ? 'Published' : 'Draft';
        const updatePromises = selectedIds.map(id => productService.update(id, { status: statusVal }));
        const results = await Promise.all(updatePromises);
        const failedCount = results.filter(r => !r.success).length;
        res = { success: failedCount === 0, message: failedCount > 0 ? `${failedCount} updates failed` : '' };
      }

      if (res.success) {
        showToast(`Bulk ${action} executed successfully!`, 'success');
        setSelectedIds([]);
        onRefresh?.();
      } else {
        showToast(res.message || 'Bulk execution partial failure', 'error');
      }
    } catch (err) {
      showToast('Bulk operations server failure', 'error');
    }
  };

  // Dynamic filter / search logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category;
      const catId = typeof p.category === 'object' ? p.category?._id : p.category;
      const matchesCategory = selectedCat === 'all' || catSlug === selectedCat || catId === selectedCat;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
      if (sortBy === 'titleDesc') return b.title.localeCompare(a.title);
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'stockLow') return a.stock - b.stock;
      return 0;
    });
  }, [products, searchQuery, selectedCat, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  if (view === 'list') {
    return (
      <div className="space-y-6 select-none animate-fade-in text-left">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-[#eae8d8] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search catalog title, tags..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 border border-[#eae8d8] text-xs font-semibold text-black focus:outline-none focus:border-[#729855] rounded-none bg-[#fcfcfa]"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => { setSelectedCat(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2.5 border border-[#eae8d8] text-xs font-semibold text-black bg-[#fcfcfa] focus:outline-none rounded-none cursor-pointer"
            >
              <option value="all">All Collections</option>
              {categories.map(c => (
                <option key={c._id} value={c.slug || c._id}>{c.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 border border-[#eae8d8] text-xs font-semibold text-black bg-[#fcfcfa] focus:outline-none rounded-none cursor-pointer"
            >
              <option value="titleAsc">Title: Alphabetical (A-Z)</option>
              <option value="titleDesc">Title: Alphabetical (Z-A)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="stockLow">Stock Count: Low Alert</option>
            </select>
          </div>

          <button
            onClick={() => { resetForm(); setView('form'); }}
            className="bg-[#2f3e10] hover:bg-black text-white px-5 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all rounded-none border-none cursor-pointer flex items-center justify-center gap-1.5"
          >
            + Create Product
          </button>
        </div>

        {/* Bulk Actions Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in rounded-none">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-amber-700" />
              {selectedIds.length} Selected items ready for Bulk Operation
            </span>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button onClick={() => handleBulkAction('publish')} className="bg-[#2f3e10] hover:bg-black text-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none rounded-none transition-colors">Publish</button>
              <button onClick={() => handleBulkAction('draft')} className="bg-gray-600 hover:bg-black text-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none rounded-none transition-colors">Draft</button>
              <button onClick={() => handleBulkAction('delete')} className="bg-red-600 hover:bg-red-800 text-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none rounded-none transition-colors">Delete</button>
            </div>
          </div>
        )}

        {/* Stock Warning Panel */}
        {products.some(p => p.stock <= 5) && (
          <div className="bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-red-900 rounded-none">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wide">Critical Stock Warning: </span>
              Some products are running low on stock (less than 5 units left). Please review stock counts below.
            </div>
          </div>
        )}

        {/* Table List View */}
        {/* Table List View */}
        <div className="bg-[#f7f6f0] md:bg-white md:border md:border-[#eae8d8] overflow-x-auto shadow-sm">
          {/* Mobile Card Grid View */}
          <div className="md:hidden space-y-4">
            {paginatedProducts.map((prod) => {
              const imageSrc = getLocalImageUrl(prod.images?.[0] || prod.image || '/assets/14.jpg');
              const collectionName = typeof prod.category === 'object' ? prod.category?.name : prod.category;

              return (
                <div key={prod._id} className="bg-white border border-[#eae8d8] p-5 flex flex-col gap-4 text-xs shadow-xs text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod._id)}
                        onChange={() => handleCheckboxToggle(prod._id)}
                        className="cursor-pointer accent-[#729855] w-5 h-5"
                      />
                      <img
                        src={imageSrc}
                        alt=""
                        className="w-12 h-14 object-cover border border-[#eae8d8] bg-[#fcfcfa] mix-blend-darken"
                      />
                      <div>
                        <h4 className="font-semibold text-black leading-snug text-sm uppercase tracking-wide">{prod.title}</h4>
                        <span className="text-gray-500 font-semibold capitalize mt-1 block">{collectionName || 'General'}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      prod.status === 'Published' 
                        ? 'bg-green-50 text-[#729855]' 
                        : prod.status === 'Draft' 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {prod.status || 'Published'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-b border-[#eae8d8]/50 py-3 text-center text-gray-600 font-semibold">
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Price</div>
                      <span className="text-black font-bold font-heading">{formatPrice(prod.price)}</span>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Compare</div>
                      <span className="font-mono text-xs">{prod.comparePrice > 0 ? formatPrice(prod.comparePrice) : '—'}</span>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Stock</div>
                      <span className={prod.stock <= 5 ? 'text-red-600 font-bold bg-red-50 px-1 py-0.5' : ''}>{prod.stock} units</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditClick(prod)}
                      className="flex-grow py-3 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] font-heading font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod._id)}
                      className="py-3 px-4 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] flex items-center justify-center"
                      aria-label={`Delete ${prod.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="bg-white border border-[#eae8d8] p-8 text-center italic text-gray-400">No matching products found in the catalog.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse text-xs hidden md:table">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(paginatedProducts.map(p => p._id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="cursor-pointer accent-[#729855]"
                  />
                </th>
                <th className="p-4">Media</th>
                <th className="p-4">Product Title</th>
                <th className="p-4">Collection</th>
                <th className="p-4">Retail Price</th>
                <th className="p-4">Compare Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {paginatedProducts.map((prod) => {
                const imageSrc = getLocalImageUrl(prod.images?.[0] || prod.image || '/assets/14.jpg');
                const collectionName = typeof prod.category === 'object' ? prod.category?.name : prod.category;
                
                return (
                  <tr key={prod._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod._id)}
                        onChange={() => handleCheckboxToggle(prod._id)}
                        className="cursor-pointer accent-[#729855]"
                      />
                    </td>
                    <td className="p-4">
                      <img
                        src={imageSrc}
                        alt=""
                        className="w-10 h-12 object-cover border border-[#eae8d8] bg-[#fcfcfa] mix-blend-darken"
                      />
                    </td>
                    <td className="p-4 font-semibold text-black leading-snug max-w-xs">{prod.title}</td>
                    <td className="p-4 capitalize text-gray-500 font-semibold">{collectionName || 'General'}</td>
                    <td className="p-4 font-heading font-bold text-sm text-black">{formatPrice(prod.price)}</td>
                    <td className="p-4 text-gray-400 font-mono">{prod.comparePrice > 0 ? formatPrice(prod.comparePrice) : '—'}</td>
                    <td className="p-4 font-semibold">
                      <span className={prod.stock <= 5 ? 'text-red-600 font-bold bg-red-50 px-2 py-1' : 'text-gray-500'}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="p-4 select-none">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        prod.status === 'Published' 
                          ? 'bg-green-50 text-[#729855]' 
                          : prod.status === 'Draft' 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {prod.status || 'Published'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(prod)}
                          className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa]"
                          aria-label={`Edit ${prod.title}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa]"
                          aria-label={`Delete ${prod.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-12 text-center italic text-gray-400">No matching products found in the catalog.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-[#eae8d8] p-4 text-xs font-semibold text-black select-none">
            <span className="text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(c => Math.max(1, c - 1))} 
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-[#eae8d8] bg-[#fcfcfa] hover:border-black cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} 
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-[#eae8d8] bg-[#fcfcfa] hover:border-black cursor-pointer disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Shopify-style Create/Edit Product Form
  return (
    <div className="bg-white border border-[#eae8d8] p-8 md:p-14 max-w-4xl mx-auto shadow-sm text-left animate-fade-in">
      
      {/* Form Header */}
      <div className="flex justify-between items-center border-b border-[#eae8d8] pb-4 mb-8">
        <h3 className="serif-title text-2xl text-black uppercase font-medium tracking-wide">
          {editingProduct ? `Edit: ${editingProduct.title}` : 'Create New Product'}
        </h3>
        <button
          onClick={() => { resetForm(); setView('list'); }}
          className="text-gray-500 hover:text-black font-heading text-[10px] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer"
        >
          ← Cancel
        </button>
      </div>

      {error && <ErrorAlert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Product Title *</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Category Collection *</label>
            <select 
              value={category} 
              required
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full border border-[#eae8d8] bg-white px-4 py-3.5 text-xs font-semibold uppercase tracking-wider focus:outline-none rounded-none cursor-pointer"
            >
              <option value="" disabled>Select collection...</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing, Inventory and Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Retail Price (Rs.) *</label>
            <input 
              type="number" 
              required 
              min="0"
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Compare Price (Rs.)</label>
            <input 
              type="number" 
              min="0"
              placeholder="Original Price"
              value={comparePrice} 
              onChange={(e) => setComparePrice(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Stock Count *</label>
            <input 
              type="number" 
              required
              min="0"
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Publish Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full border border-[#eae8d8] bg-white px-4 py-3.5 text-xs font-semibold uppercase tracking-wider focus:outline-none rounded-none cursor-pointer"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* HIGH FIDELITY MEDIA UPLOADER */}
        <div className="space-y-4">
          <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] block">Product Media</label>
          
          {/* Dropzone Container */}
          <div 
            ref={dropzoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#eae8d8] hover:border-[#729855] bg-[#fcfcfa] p-8 flex flex-col items-center justify-center text-center relative cursor-pointer group transition-colors select-none"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#729855] transition-colors mb-3" />
            <p className="text-xs font-semibold text-black">Drag and drop file here, or click to upload</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">PNG, JPG, WEBP up to 5MB</p>
          </div>

          {/* Staged & Existing Images Manager Grid */}
          {(existingImages.length > 0 || stagedPreviews.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
              
              {/* Existing Images */}
              {existingImages.map((img, idx) => (
                <div 
                  key={img.public_id} 
                  className={`group/card relative aspect-[3/4] border ${
                    idx === 0 ? 'border-[#729855] ring-2 ring-[#729855]/20' : 'border-[#eae8d8]'
                  } bg-gray-50 flex flex-col items-center justify-center p-1 select-none`}
                >
                  <img src={getLocalImageUrl(img)} alt="" className="w-full h-full object-cover mix-blend-darken" />
                  
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-[#729855] text-white text-[8px] font-bold px-1 py-0.5 uppercase tracking-wider z-10">Primary</span>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.public_id)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-800 text-white rounded-full p-1 border-none cursor-pointer transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex gap-1 justify-center mt-auto w-full">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveExistingLeft(idx)}
                        className="p-1 border border-white/50 text-white bg-transparent hover:bg-white hover:text-black cursor-pointer rounded-none disabled:opacity-30"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExistingPrimary(idx)}
                        className="text-[9px] font-heading font-bold uppercase tracking-wider bg-white text-black hover:bg-black hover:text-white px-2 py-1 cursor-pointer rounded-none"
                      >
                        Main
                      </button>
                      <button
                        type="button"
                        disabled={idx === existingImages.length - 1}
                        onClick={() => moveExistingRight(idx)}
                        className="p-1 border border-white/50 text-white bg-transparent hover:bg-white hover:text-black cursor-pointer rounded-none disabled:opacity-30"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Staged New Previews */}
              {stagedPreviews.map((p, idx) => (
                <div 
                  key={p.id} 
                  className={`group/card relative aspect-[3/4] border ${
                    (existingImages.length === 0 && idx === 0) ? 'border-[#729855] ring-2 ring-[#729855]/20' : 'border-[#eae8d8]'
                  } bg-gray-50 flex flex-col items-center justify-center p-1 select-none`}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover mix-blend-darken opacity-75" />
                  
                  {existingImages.length === 0 && idx === 0 && (
                    <span className="absolute top-1 left-1 bg-[#729855] text-white text-[8px] font-bold px-1 py-0.5 uppercase tracking-wider z-10">Primary</span>
                  )}

                  {/* Progress Bar overlay */}
                  {p.status === 'uploading' && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center p-3 select-none">
                      <span className="text-[10px] font-bold text-[#729855] animate-pulse uppercase tracking-wider mb-2">Staging File</span>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#729855] h-full transition-all duration-300" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono mt-1">{p.progress}%</span>
                    </div>
                  )}

                  {/* Staged actions overlay */}
                  {p.status === 'ready' && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                      <button
                        type="button"
                        onClick={() => removeStagedPreview(p.id, idx)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-800 text-white rounded-full p-1 border-none cursor-pointer transition-colors shadow-sm"
                        title="Remove staging image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex gap-1 justify-center mt-auto w-full">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveStagedLeft(idx)}
                          className="p-1 border border-white/50 text-white bg-transparent hover:bg-white hover:text-black cursor-pointer rounded-none disabled:opacity-30"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedPrimary(idx)}
                          className="text-[9px] font-heading font-bold uppercase tracking-wider bg-white text-black hover:bg-black hover:text-white px-2 py-1 cursor-pointer rounded-none"
                        >
                          Main
                        </button>
                        <button
                          type="button"
                          disabled={idx === stagedPreviews.length - 1}
                          onClick={() => moveStagedRight(idx)}
                          className="p-1 border border-white/50 text-white bg-transparent hover:bg-white hover:text-black cursor-pointer rounded-none disabled:opacity-30"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Variants and Tags Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Variants (comma-separated)</label>
            <input 
              type="text" 
              placeholder="50 ml, 100 ml, 200 ml" 
              value={variants} 
              onChange={(e) => setVariants(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Tags (comma-separated)</label>
            <input 
              type="text" 
              placeholder="organic, skincare, serum" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
        </div>

        {/* Product Badges */}
        <div className="border-t border-[#eae8d8] pt-6 space-y-4">
          <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] block">Product Badges / Sections</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#729855] border-[#eae8d8] cursor-pointer"
              />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555]">Featured</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={(e) => setBestSeller(e.target.checked)}
                className="w-4 h-4 accent-[#729855] border-[#eae8d8] cursor-pointer"
              />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555]">Best Seller</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="w-4 h-4 accent-[#729855] border-[#eae8d8] cursor-pointer"
              />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555]">New Arrival</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
                className="w-4 h-4 accent-[#729855] border-[#eae8d8] cursor-pointer"
              />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555]">Trending</span>
            </label>
          </div>
        </div>

        {/* SEO Search Engine Optimization */}
        <div className="border-t border-[#eae8d8] pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">SEO Metadata Search Preview</h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Google Preview</span>
          </div>

          {/* Live Search Engine Snippet Preview */}
          <div className="bg-[#f9f9f9] border border-[#eae8d8] p-5 font-sans text-left space-y-1 rounded-none select-none max-w-2xl">
            <span className="text-xs text-[#202124] block truncate">https://fabish.com/products/{(title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-slug')}</span>
            <span className="text-xl text-[#1a0dab] hover:underline block truncate font-medium">{metaTitle || title || 'SEO Custom Search Result Title'}</span>
            <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
              {metaDescription || description?.slice(0, 155) || 'SEO Snippet description preview. Add meta descriptions below to hook search engine click pools.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Meta Title</label>
              <input 
                type="text" 
                placeholder={title || "SEO Custom Title"} 
                value={metaTitle} 
                onChange={(e) => setMetaTitle(e.target.value)} 
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
              />
            </div>
            
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Meta Description</label>
              <textarea 
                placeholder={description?.slice(0, 150) || "SEO Description preview..."} 
                rows={2} 
                value={metaDescription} 
                onChange={(e) => setMetaDescription(e.target.value)} 
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
              />
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Product Description *</label>
          <textarea 
            required 
            rows={6} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
          ></textarea>
        </div>

        {/* Submission / Cancel controls */}
        <div className="flex gap-4 pt-6 border-t border-[#eae8d8]">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-grow bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader size="small" /> : <Save className="w-4 h-4" />}
            {editingProduct ? 'Save Product Changes' : 'Publish Product'}
          </button>
          
          <button 
            type="button" 
            onClick={() => { resetForm(); setView('list'); }} 
            className="border border-black text-black hover:bg-black hover:text-white px-8 py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer bg-white rounded-none"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminProducts;
