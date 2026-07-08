import React, { useState, useRef } from 'react';
import { Edit, Trash2, Plus, ArrowLeft, Upload, X, Save, AlertCircle, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useCategories } from '../../context/CategoryContext';
import { getLocalImageUrl } from '../../utils/imageMapper';

// Helper to build hierarchy tree from flat categories list
const buildHierarchy = (items) => {
  const itemMap = {};
  items.forEach(item => {
    itemMap[item._id] = { ...item, children: [] };
  });

  const roots = [];
  items.forEach(item => {
    const parentId = item.parentCategory ? (typeof item.parentCategory === 'object' ? item.parentCategory._id : item.parentCategory) : null;
    if (parentId && itemMap[parentId]) {
      itemMap[parentId].children.push(itemMap[item._id]);
    } else {
      roots.push(itemMap[item._id]);
    }
  });

  return roots;
};

// Helper to flatten hierarchy with depth information for display rendering
const flattenHierarchy = (nodes, depth = 0, result = []) => {
  nodes.forEach(node => {
    result.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      flattenHierarchy(node.children, depth + 1, result);
    }
  });
  return result;
};

// Check if a child category is a descendant of a prospective parent category
const isDescendant = (childId, parentId, items) => {
  const itemMap = {};
  items.forEach(item => {
    itemMap[item._id] = item;
  });

  let current = itemMap[childId];
  while (current && current.parentCategory) {
    const nextId = typeof current.parentCategory === 'object' ? current.parentCategory._id : current.parentCategory;
    if (nextId === parentId) return true;
    current = itemMap[nextId];
  }
  return false;
};

// Check recursively if a category is visible (i.e. none of its ancestors are collapsed)
const isVisible = (cat, items, collapsedSet) => {
  let parentId = cat.parentCategory ? (typeof cat.parentCategory === 'object' ? cat.parentCategory._id : cat.parentCategory) : null;
  const itemMap = {};
  items.forEach(item => {
    itemMap[item._id] = item;
  });

  while (parentId) {
    if (collapsedSet.has(parentId)) {
      return false;
    }
    const parent = itemMap[parentId];
    parentId = parent && parent.parentCategory ? (typeof parent.parentCategory === 'object' ? parent.parentCategory._id : parent.parentCategory) : null;
  }
  return true;
};

const AdminCategories = ({ categories = [], onRefresh }) => {
  useDocumentTitle('Admin - Categories');
  const { showToast } = useToast();
  const { refreshCategories } = useCategories();

  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  const toggleCollapse = (id) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const parentIds = React.useMemo(() => {
    return new Set(
      categories
        .map(c => c.parentCategory ? (typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory) : null)
        .filter(Boolean)
    );
  }, [categories]);

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Published'); // Published | Draft | Hidden
  const [parentCategory, setParentCategory] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Media state
  const [existingImage, setExistingImage] = useState('');
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedPreview, setStagedPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setStatus('Published');
    setParentCategory('');
    setMetaTitle('');
    setMetaDescription('');
    setExistingImage('');
    setStagedFile(null);
    setStagedPreview('');
    setError('');
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setStatus(cat.status || 'Published');
    setParentCategory(cat.parentCategory ? (typeof cat.parentCategory === 'object' ? cat.parentCategory._id : cat.parentCategory) : '');
    setMetaTitle(cat.seoTitle || '');
    setMetaDescription(cat.seoDescription || '');
    setExistingImage(cat.image || '');
    setStagedFile(null);
    setStagedPreview('');
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection permanently? This will remove all associated files from Cloudinary and MongoDB.')) return;
    try {
      const res = await categoryService.delete(id);
      if (res.success) {
        showToast('Collection deleted successfully!', 'success');
        refreshCategories();
        onRefresh?.();
      } else {
        showToast(res.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }
      setStagedFile(file);
      setStagedPreview(URL.createObjectURL(file));
      showToast('Collection image staged successfully!', 'success');
    }
  };

  const removeStagedImage = () => {
    setStagedFile(null);
    setStagedPreview('');
  };

  const removeExistingImage = () => {
    setExistingImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim() || !slug.trim()) {
      setError('Please fill in Name and Slug.');
      setLoading(false);
      return;
    }

    // Assemble FormData payload for image upload
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('slug', slug.trim().toLowerCase().replace(/\s+/g, '-'));
    formData.append('description', description.trim());
    formData.append('status', status);
    formData.append('parentCategory', parentCategory || '');
    formData.append('seoTitle', metaTitle || name.trim());
    formData.append('seoDescription', metaDescription || description.trim().slice(0, 150));

    if (stagedFile) {
      formData.append('image', stagedFile);
    } else if (existingImage) {
      formData.append('image', existingImage);
    }

    try {
      const result = editingCategory
        ? await categoryService.update(editingCategory._id, formData)
        : await categoryService.create(formData);

      setLoading(false);
      if (result.success) {
        showToast(editingCategory ? 'Collection updated successfully!' : 'Collection created successfully!', 'success');
        resetForm();
        setView('list');
        refreshCategories(); // dynamic sidebar sync
        onRefresh?.();
      } else {
        setError(result.message || 'Action failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Server connection failed. Validate parameters.');
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 select-none animate-fade-in text-left">
        <div className="flex justify-between items-center bg-white border border-[#eae8d8] p-5">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider">Store Collections</h3>
            <p className="text-xs text-gray-400 mt-1">Manage shop collections, categories and SEO tags</p>
          </div>
          <button
            onClick={() => { resetForm(); setView('form'); }}
            className="bg-[#2f3e10] hover:bg-black text-white px-5 py-3 font-heading font-bold text-xs uppercase tracking-widest border-none cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
              <tr>
                <th className="p-4">Collection Banner</th>
                <th className="p-4">Collection Name</th>
                <th className="p-4">URL Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Publish Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {flattenHierarchy(buildHierarchy(categories))
                .filter(cat => isVisible(cat, categories, collapsedCategories))
                .map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                    <td className="p-4">
                      {cat.image ? (
                        <img
                          src={getLocalImageUrl(cat.image)}
                          alt=""
                          className="w-14 h-9 object-cover border border-[#eae8d8] bg-[#fcfcfa]"
                        />
                      ) : (
                        <span className="text-gray-400 font-mono italic">No Image</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-black leading-snug">
                      <div className="flex items-center gap-1.5">
                        {/* Indentation for nested subcategories */}
                        {cat.depth > 0 ? (
                          <span className="text-gray-400 font-normal font-mono select-none">
                            {'│   '.repeat(cat.depth - 1)}├──{' '}
                          </span>
                        ) : null}

                        {/* Expand/Collapse Chevron Button */}
                        {parentIds.has(cat._id) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCollapse(cat._id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer bg-transparent border-none flex items-center justify-center"
                            aria-label={collapsedCategories.has(cat._id) ? "Expand" : "Collapse"}
                          >
                            {collapsedCategories.has(cat._id) ? (
                              <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          // Aligner placeholder to keep text aligned
                          <div className="w-5.5" />
                        )}

                        {/* Folder/File emoji icon */}
                        {parentIds.has(cat._id) ? (
                          <span className="text-sm select-none">📁</span>
                        ) : (
                          <span className="text-sm select-none">📄</span>
                        )}

                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-500">{cat.slug}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{cat.description || 'No description provided.'}</td>
                    <td className="p-4 select-none">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cat.status === 'Published'
                        ? 'bg-green-50 text-[#729855]'
                        : cat.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                        {cat.status || 'Published'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa]"
                          aria-label={`Edit collection ${cat.name}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa]"
                          aria-label={`Delete collection ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center italic text-gray-400">No categories found in store database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#eae8d8] p-8 md:p-14 max-w-3xl mx-auto shadow-sm text-left animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#eae8d8] pb-4 mb-8">
        <h3 className="serif-title text-2xl text-black uppercase font-medium tracking-wide">
          {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Category'}
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

        {/* Collection Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
              }}
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
            />
          </div>

          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
            />
          </div>
        </div>

        {/* Status and Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
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

            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Parent Category</label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full border border-[#eae8d8] bg-white px-4 py-3.5 text-xs font-semibold uppercase tracking-wider focus:outline-none rounded-none cursor-pointer"
              >
                <option value="">None (Root Category)</option>
                {flattenHierarchy(buildHierarchy(categories)).map((c) => {
                  // Don't allow selecting self or descendants as parent
                  if (editingCategory && (c._id === editingCategory._id || isDescendant(c._id, editingCategory._id, categories))) {
                    return null;
                  }
                  return (
                    <option key={c._id} value={c._id}>
                      {'\u00A0\u00A0'.repeat(c.depth)}{c.depth > 0 ? '├── ' : ''}{c.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Collection Image Banner</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-transparent border border-black text-black px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer rounded-none flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Image Previews */}
              {stagedPreview && (
                <div className="relative w-16 h-10 border border-[#eae8d8]">
                  <img src={stagedPreview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeStagedImage}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 cursor-pointer shadow-sm hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {existingImage && !stagedPreview && (
                <div className="relative w-16 h-10 border border-[#eae8d8]">
                  <img src={getLocalImageUrl(existingImage)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeExistingImage}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 cursor-pointer shadow-sm hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Customization */}
        <div className="border-t border-[#eae8d8] pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">SEO Listing Preview</h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Google Preview</span>
          </div>

          <div className="bg-[#f9f9f9] border border-[#eae8d8] p-5 font-sans text-left space-y-1 rounded-none max-w-2xl select-none">
            <span className="text-xs text-[#202124] block truncate">https://fabish.com/collections/{(slug ? slug : 'collection-slug')}</span>
            <span className="text-xl text-[#1a0dab] hover:underline block truncate font-medium">{metaTitle || name || 'SEO Collection Title'}</span>
            <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
              {metaDescription || description?.slice(0, 155) || 'Collection category meta details will display here in search engine indexes. Update meta descriptions below.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Meta Title</label>
              <input
                type="text"
                placeholder={name || "SEO Custom Title"}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
              />
            </div>

            <div>
              <label className="font-[#555] font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Meta Description</label>
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

        {/* Collection Description */}
        <div>
          <label className="font-[#555] font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Category Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
        >
          {loading && <Plus className="w-4 h-4 animate-spin" />}
          {editingCategory ? 'Save Collection Changes' : 'Publish Collection'}
        </button>
      </form>
    </div>
  );
};

export default AdminCategories;