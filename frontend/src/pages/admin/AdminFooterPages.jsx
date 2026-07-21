import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Copy, RotateCcw, GripVertical,
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ExternalLink, FileText, Trash, X, Check, AlertTriangle, Upload,
  RefreshCw, Globe, EyeIcon,
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { footerPageService } from '../../api/footerPageService';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block',
  'link', 'image', 'color', 'background',
];

const STATUS_BADGE = {
  Published: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Archived: 'bg-gray-100 text-gray-500',
};

const INITIAL_FORM = {
  title: '', slug: '', shortDescription: '', content: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
  status: 'Draft', showInFooter: true, displayOrder: 0,
  existingFeaturedImageUrl: '', existingBannerImageUrl: '',
  featuredImageAlt: '', bannerImageAlt: '',
};

/* ─── Confirm Modal ──────────────────────────────────────────────────────── */
const ConfirmModal = ({ message, onConfirm, onCancel, danger = false }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
        <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
      </div>
      <p className="text-center text-gray-700 text-sm mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2 rounded text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-[#8B5A2B]'}`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

/* ─── Image Upload Field ──────────────────────────────────────────────────── */
const ImageUploadField = ({ label, fieldName, preview, onFileChange, onClear }) => {
  const inputRef = useRef();
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-300 transition-colors relative"
        onClick={() => inputRef.current?.click()}>
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-32 object-cover rounded" />
            <button type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
              <X size={10} />
            </button>
          </div>
        ) : (
          <div className="text-gray-400">
            <Upload size={24} className="mx-auto mb-2" />
            <p className="text-xs">Click to upload {label}</p>
            <p className="text-xs text-gray-300 mt-1">JPEG, PNG, WEBP — Max 5MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" name={fieldName} accept="image/*" className="hidden"
          onChange={(e) => onFileChange(e.target.files[0])} />
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AdminFooterPages = () => {
  useDocumentTitle('Admin — Footer Pages CMS');
  const { showToast } = useToast();

  /* State */
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [tab, setTab] = useState('active'); // 'active' | 'trash'
  const [editingPage, setEditingPage] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirm, setConfirm] = useState(null);

  /* Pagination / Filter */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('displayOrder');
  const [sortOrder, setSortOrder] = useState('asc');

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        trash: tab === 'trash' ? 'true' : 'false',
        sortField,
        sortOrder,
      };
      const res = await footerPageService.adminList(params);
      if (res.success) {
        setPages(res.data?.pages || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.totalPages || 1);
      } else {
        showToast(res.message || 'Failed to load pages', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, statusFilter, tab, sortField, sortOrder]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  /* ── Form helpers ───────────────────────────────────────────────── */
  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFeaturedImageFile(null);
    setFeaturedImagePreview('');
    setBannerImageFile(null);
    setBannerImagePreview('');
    setEditingPage(null);
  };

  const handleNew = () => {
    resetForm();
    setView('form');
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      shortDescription: page.shortDescription || '',
      content: page.content || '',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      seoKeywords: (page.seoKeywords || []).join(', '),
      status: page.status || 'Draft',
      showInFooter: page.showInFooter !== false,
      displayOrder: page.displayOrder || 0,
      existingFeaturedImageUrl: page.featuredImage?.url || '',
      existingBannerImageUrl: page.bannerImage?.url || '',
      featuredImageAlt: page.featuredImage?.alt || '',
      bannerImageAlt: page.bannerImage?.alt || '',
    });
    setFeaturedImagePreview(page.featuredImage?.url || '');
    setBannerImagePreview(page.bannerImage?.url || '');
    setFeaturedImageFile(null);
    setBannerImageFile(null);
    setView('form');
  };

  /* ── Title → Slug auto-generation ──────────────────────────────── */
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const autoSlug = title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setForm((f) => ({
      ...f,
      title,
      ...(!editingPage && { slug: autoSlug }),
    }));
  };

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) fd.append(key, val);
      });
      if (featuredImageFile) fd.append('featuredImage', featuredImageFile);
      if (bannerImageFile) fd.append('bannerImage', bannerImageFile);

      const res = editingPage
        ? await footerPageService.update(editingPage._id, fd)
        : await footerPageService.create(fd);

      if (res.success) {
        showToast(editingPage ? 'Page updated successfully' : 'Page created successfully', 'success');
        resetForm();
        setView('list');
        fetchPages();
      } else {
        showToast(res.message || 'Save failed', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle Status ──────────────────────────────────────────────── */
  const handleToggleStatus = async (page) => {
    const newStatus = page.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await footerPageService.toggleStatus(page._id, newStatus);
      if (res.success) {
        showToast(`Page ${newStatus === 'Published' ? 'published' : 'unpublished'}`, 'success');
        fetchPages();
      } else {
        showToast(res.message || 'Toggle failed', 'error');
      }
    } catch { showToast('Connection error', 'error'); }
  };

  /* ── Toggle Footer Visibility ───────────────────────────────────── */
  const handleToggleFooter = async (page) => {
    try {
      const res = await footerPageService.toggleFooterVisibility(page._id, !page.showInFooter);
      if (res.success) {
        showToast(`Footer visibility updated`, 'success');
        fetchPages();
      } else {
        showToast(res.message || 'Update failed', 'error');
      }
    } catch { showToast('Connection error', 'error'); }
  };

  /* ── Soft Delete ────────────────────────────────────────────────── */
  const handleDelete = (page) => {
    setConfirm({
      message: `Move "${page.title}" to trash? You can restore it later.`,
      danger: false,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await footerPageService.softDelete(page._id);
          if (res.success) { showToast('Page moved to trash', 'success'); fetchPages(); }
          else showToast(res.message || 'Delete failed', 'error');
        } catch { showToast('Connection error', 'error'); }
      },
    });
  };

  /* ── Restore ────────────────────────────────────────────────────── */
  const handleRestore = async (page) => {
    try {
      const res = await footerPageService.restore(page._id);
      if (res.success) { showToast('Page restored', 'success'); fetchPages(); }
      else showToast(res.message || 'Restore failed', 'error');
    } catch { showToast('Connection error', 'error'); }
  };

  /* ── Hard Delete ────────────────────────────────────────────────── */
  const handleHardDelete = (page) => {
    setConfirm({
      message: `Permanently delete "${page.title}"? This cannot be undone and will remove all images.`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await footerPageService.hardDelete(page._id);
          if (res.success) { showToast('Page permanently deleted', 'success'); fetchPages(); }
          else showToast(res.message || 'Delete failed', 'error');
        } catch { showToast('Connection error', 'error'); }
      },
    });
  };

  /* ── Duplicate ──────────────────────────────────────────────────── */
  const handleDuplicate = async (page) => {
    try {
      const res = await footerPageService.duplicate(page._id);
      if (res.success) { showToast('Page duplicated as Draft', 'success'); fetchPages(); }
      else showToast(res.message || 'Duplicate failed', 'error');
    } catch { showToast('Connection error', 'error'); }
  };

  /* ── Drag & Drop Reorder ────────────────────────────────────────── */
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(pages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPages(reordered);

    const items = reordered.map((p, i) => ({ id: p._id, displayOrder: i + 1 }));
    try {
      const res = await footerPageService.reorder(items);
      if (!res.success) showToast('Reorder failed to save', 'error');
      else showToast('Order saved', 'success');
    } catch { showToast('Connection error', 'error'); }
  };

  /* ── Bulk Actions ───────────────────────────────────────────────── */
  const handleBulkAction = (action) => {
    if (!selectedIds.length) { showToast('Select at least one page', 'error'); return; }
    const labels = { delete: 'move to trash', publish: 'publish', unpublish: 'unpublish' };
    setConfirm({
      message: `${labels[action]} ${selectedIds.length} page(s)?`,
      danger: action === 'delete',
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await footerPageService.bulkAction(action, selectedIds);
          if (res.success) {
            showToast(res.message || 'Bulk action completed', 'success');
            setSelectedIds([]);
            fetchPages();
          } else {
            showToast(res.message || 'Bulk action failed', 'error');
          }
        } catch { showToast('Connection error', 'error'); }
      },
    });
  };

  /* ── Sort ───────────────────────────────────────────────────────── */
  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-300" />;
    return sortOrder === 'asc'
      ? <ChevronUp size={14} className="text-gray-600" />
      : <ChevronDown size={14} className="text-gray-600" />;
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-[1200px] mx-auto" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Footer Pages
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all CMS pages that appear in the footer navigation</p>
        </div>
        {view === 'list' ? (
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-[#8B5A2B] transition-colors"
            id="btn-add-footer-page"
          >
            <Plus size={16} /> Add New Page
          </button>
        ) : (
          <button
            onClick={() => { resetForm(); setView('list'); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      {/* ── FORM VIEW ─────────────────────────────────────────────────── */}
      {view === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Title & Slug */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Page Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fp-title"
                      type="text"
                      value={form.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Support Request"
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">/pages/</span>
                      <input
                        id="fp-slug"
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                        placeholder="support-request"
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Short Description</label>
                    <textarea
                      id="fp-short-desc"
                      value={form.shortDescription}
                      onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                      placeholder="Brief summary shown in listings and SEO previews (max 500 chars)"
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{form.shortDescription.length}/500</p>
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Page Content</h3>
                <div className="quill-wrapper border border-gray-200 rounded overflow-hidden">
                  <ReactQuill
                    value={form.content}
                    onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write rich page content here…"
                    style={{ minHeight: '300px' }}
                    id="fp-content"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} /> SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      SEO Title <span className="text-gray-400 font-normal normal-case">(max 70 chars)</span>
                    </label>
                    <input
                      id="fp-seo-title"
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                      placeholder="Overrides page title in search results"
                      maxLength={70}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{form.seoTitle.length}/70</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Meta Description <span className="text-gray-400 font-normal normal-case">(max 160 chars)</span>
                    </label>
                    <textarea
                      id="fp-seo-desc"
                      value={form.seoDescription}
                      onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                      placeholder="Shown in Google search results under the title"
                      rows={2}
                      maxLength={160}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{form.seoDescription.length}/160</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Keywords</label>
                    <input
                      id="fp-seo-keywords"
                      type="text"
                      value={form.seoKeywords}
                      onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))}
                      placeholder="skincare, organic, support (comma-separated)"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-5">
              {/* Publish Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Publish</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      id="fp-status"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Display Order</label>
                    <input
                      id="fp-order"
                      type="number"
                      min={0}
                      value={form.displayOrder}
                      onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm((f) => ({ ...f, showInFooter: !f.showInFooter }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.showInFooter ? 'bg-black' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.showInFooter ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm text-gray-600">Show in Footer Navigation</span>
                  </label>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-[#8B5A2B] transition-colors disabled:opacity-50"
                    id="btn-save-footer-page"
                  >
                    {submitting ? 'Saving…' : editingPage ? 'Update Page' : 'Create Page'}
                  </button>
                  {editingPage && (
                    <a
                      href={`/pages/${editingPage.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Preview page"
                      className="px-3 py-2.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Images</h3>
                <div className="space-y-4">
                  <ImageUploadField
                    label="Featured Image"
                    fieldName="featuredImage"
                    preview={featuredImagePreview}
                    onFileChange={(file) => {
                      setFeaturedImageFile(file);
                      setFeaturedImagePreview(URL.createObjectURL(file));
                    }}
                    onClear={() => {
                      setFeaturedImageFile(null);
                      setFeaturedImagePreview('');
                      setForm((f) => ({ ...f, existingFeaturedImageUrl: '' }));
                    }}
                  />
                  {featuredImagePreview && (
                    <input
                      type="text"
                      placeholder="Featured image alt text"
                      value={form.featuredImageAlt}
                      onChange={(e) => setForm((f) => ({ ...f, featuredImageAlt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-black transition-colors"
                    />
                  )}
                  <ImageUploadField
                    label="Banner Image"
                    fieldName="bannerImage"
                    preview={bannerImagePreview}
                    onFileChange={(file) => {
                      setBannerImageFile(file);
                      setBannerImagePreview(URL.createObjectURL(file));
                    }}
                    onClear={() => {
                      setBannerImageFile(null);
                      setBannerImagePreview('');
                      setForm((f) => ({ ...f, existingBannerImageUrl: '' }));
                    }}
                  />
                  {bannerImagePreview && (
                    <input
                      type="text"
                      placeholder="Banner image alt text"
                      value={form.bannerImageAlt}
                      onChange={(e) => setForm((f) => ({ ...f, bannerImageAlt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-black transition-colors"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 mb-5">
            {['active', 'trash'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setCurrentPage(1); setSelectedIds([]); }}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize flex items-center gap-2 ${
                  tab === t ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'trash' ? <Trash size={14} /> : <FileText size={14} />}
                {t === 'active' ? 'All Pages' : 'Trash'} {tab === t && total > 0 && `(${total})`}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                id="fp-search"
              />
            </div>
            {tab === 'active' && (
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2.5 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-black transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            )}
            <button onClick={fetchPages} className="px-3 py-2.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && tab === 'active' && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600 font-medium">{selectedIds.length} selected</span>
              <div className="h-4 w-px bg-gray-300" />
              <button onClick={() => handleBulkAction('publish')}
                className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center gap-1">
                <Check size={12} /> Publish
              </button>
              <button onClick={() => handleBulkAction('unpublish')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                <EyeOff size={12} /> Unpublish
              </button>
              <button onClick={() => handleBulkAction('delete')}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setSelectedIds([])} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">{tab === 'trash' ? 'Trash is empty' : 'No footer pages yet'}</p>
              {tab === 'active' && (
                <button onClick={handleNew} className="mt-4 text-sm underline hover:text-black">
                  Create your first page
                </button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={tab === 'active' ? handleDragEnd : undefined}>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[32px_32px_1fr_120px_100px_90px_160px] gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div />
                  <input
                    type="checkbox"
                    checked={selectedIds.length === pages.length && pages.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? pages.map((p) => p._id) : [])}
                    className="mt-0.5"
                  />
                  <button onClick={() => handleSort('title')} className="flex items-center gap-1 text-left">
                    Title <SortIcon field="title" />
                  </button>
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1">
                    Status <SortIcon field="status" />
                  </button>
                  <button onClick={() => handleSort('displayOrder')} className="flex items-center gap-1">
                    Order <SortIcon field="displayOrder" />
                  </button>
                  <div>Footer</div>
                  <div className="text-right">Actions</div>
                </div>

                <Droppable droppableId="footer-pages" isDropDisabled={tab === 'trash'}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {pages.map((page, index) => (
                        <Draggable key={page._id} draggableId={page._id} index={index} isDragDisabled={tab === 'trash'}>
                          {(drag, snapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              className={`grid grid-cols-[32px_32px_1fr_120px_100px_90px_160px] gap-2 px-4 py-3.5 items-center border-b border-gray-100 last:border-0 transition-colors ${snapshot.isDragging ? 'bg-amber-50 shadow-lg' : 'hover:bg-gray-50'}`}
                            >
                              {/* Drag handle */}
                              <div {...drag.dragHandleProps} className={`cursor-grab text-gray-300 hover:text-gray-500 flex items-center ${tab === 'trash' ? 'opacity-0 pointer-events-none' : ''}`}>
                                <GripVertical size={16} />
                              </div>

                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(page._id)}
                                onChange={(e) => setSelectedIds(e.target.checked
                                  ? [...selectedIds, page._id]
                                  : selectedIds.filter((id) => id !== page._id))}
                                className="mt-0.5"
                              />

                              {/* Title + slug */}
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{page.title}</p>
                                <p className="text-xs text-gray-400 font-mono truncate">/pages/{page.slug}</p>
                              </div>

                              {/* Status badge */}
                              <div>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[page.status] || 'bg-gray-100 text-gray-500'}`}>
                                  {page.status}
                                </span>
                              </div>

                              {/* Display order */}
                              <div className="text-sm text-gray-500 text-center">{page.displayOrder}</div>

                              {/* Footer toggle */}
                              <div className="flex justify-center">
                                {tab === 'active' ? (
                                  <button
                                    onClick={() => handleToggleFooter(page)}
                                    title={page.showInFooter ? 'Visible in footer' : 'Hidden from footer'}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${page.showInFooter ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                  >
                                    {page.showInFooter ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </button>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-1">
                                {tab === 'trash' ? (
                                  <>
                                    <button onClick={() => handleRestore(page)} title="Restore"
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                                      <RotateCcw size={14} />
                                    </button>
                                    <button onClick={() => handleHardDelete(page)} title="Delete permanently"
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleToggleStatus(page)}
                                      title={page.status === 'Published' ? 'Unpublish' : 'Publish'}
                                      className={`p-1.5 rounded transition-colors ${page.status === 'Published' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                                      {page.status === 'Published' ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button onClick={() => handleEdit(page)} title="Edit"
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                      <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDuplicate(page)} title="Duplicate"
                                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                                      <Copy size={14} />
                                    </button>
                                    <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" title="Preview"
                                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors flex">
                                      <ExternalLink size={14} />
                                    </a>
                                    <button onClick={() => handleDelete(page)} title="Move to trash"
                                      className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-gray-500">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)}–{Math.min(currentPage * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 text-sm rounded border transition-colors ${currentPage === i + 1 ? 'bg-black text-white border-black' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quill override styles */}
      <style>{`
        .quill-wrapper .ql-editor { min-height: 280px; font-family: "Work Sans", sans-serif; font-size: 14px; }
        .quill-wrapper .ql-toolbar { border-top: none; border-left: none; border-right: none; background: #f9f9f9; }
        .quill-wrapper .ql-container { border: none; }
      `}</style>
    </div>
  );
};

export default AdminFooterPages;
