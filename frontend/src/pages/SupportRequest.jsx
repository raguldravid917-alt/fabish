import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Ticket, PlusCircle, ClipboardList, Upload, X, Loader2 } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { supportService } from '../api/supportService';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = ['Order Issue', 'Product Quality', 'Shipping', 'Return & Refund', 'Payment', 'Account', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

/* ── Skeleton ───────────────────────────────────────────────── */
const TicketSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-[#eae8d8] p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

const SupportRequest = () => {
  useDocumentTitle('Support Center - Fabish');
  const { showToast } = useToast();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // ticket data after success

  // Form fields
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: '',
    priority: 'Medium',
    subject: '',
    description: '',
  });
  const [attachments, setAttachments] = useState([]); // File[]
  const [errors, setErrors] = useState({});

  // Ticket history
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketMeta, setTicketMeta] = useState(null);

  // Sync user info into form when auth loads
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name || f.name, email: user.email || f.email }));
    }
  }, [user]);

  const fetchMyTickets = useCallback(async (page = 1) => {
    if (!token) return;
    setTicketLoading(true);
    setTicketError('');
    try {
      const res = await supportService.getMyTickets({ page, limit: 5 });
      if (res.success) {
        setTickets(res.data?.tickets || []);
        setTicketMeta(res.data);
      } else {
        setTicketError(res.message || 'Failed to load tickets');
      }
    } catch {
      setTicketError('Could not connect to server');
    } finally {
      setTicketLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'history' && token) {
      fetchMyTickets(ticketPage);
    }
  }, [activeTab, token, ticketPage, fetchMyTickets]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - attachments.length;
    if (files.length > remaining) {
      showToast(`You can attach up to 3 files. Selecting first ${remaining}.`, 'warning');
    }
    setAttachments((prev) => [...prev, ...files].slice(0, 3));
    e.target.value = '';
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.description.trim()) errs.description = 'Please describe your issue';
    else if (form.description.trim().length < 20) errs.description = 'Please provide more detail (min 20 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    attachments.forEach((file) => fd.append('attachments', file));

    setSubmitting(true);
    try {
      const res = await supportService.createTicket(fd);
      if (res.success) {
        setSubmitted(res.data);
        setForm({ name: user?.name || '', email: user?.email || '', category: '', priority: 'Medium', subject: '', description: '' });
        setAttachments([]);
      } else {
        showToast(res.message || 'Failed to submit ticket. Please try again.', 'error');
      }
    } catch {
      showToast('Connection error. Please check your network.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Support Center' },
  ];

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left select-text">
      <PageBanner title="Support Center" breadcrumbs={breadcrumbs} />

      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-12">

        {/* Tab Bar — only show history tab if logged in */}
        <div className="flex border-b border-[#eae8d8] mb-10">
          <button
            onClick={() => { setActiveTab('new'); setSubmitted(null); }}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer bg-transparent ${activeTab === 'new' ? 'border-[#8B5A2B] text-[#8B5A2B]' : 'border-transparent text-gray-500 hover:text-black'}`}
          >
            <PlusCircle className="w-4 h-4" /> New Request
          </button>
          {token && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer bg-transparent ${activeTab === 'history' ? 'border-[#8B5A2B] text-[#8B5A2B]' : 'border-transparent text-gray-500 hover:text-black'}`}
            >
              <ClipboardList className="w-4 h-4" /> My Tickets
            </button>
          )}
        </div>

        {/* ── NEW TICKET FORM ── */}
        {activeTab === 'new' && (
          <>
            {submitted ? (
              /* ── Success State ── */
              <div className="bg-white border border-[#eae8d8] p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-black mb-2">Ticket Submitted!</h2>
                <p className="text-gray-600 mb-1">Your ticket number is:</p>
                <p className="text-3xl font-mono font-bold text-[#8B5A2B] mb-4">{submitted.ticketNumber}</p>
                <p className="text-sm text-gray-500 mb-8">We've sent a confirmation to <strong>{submitted.email}</strong>. Our team will respond within 24–48 hours.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setSubmitted(null)}
                    className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#8B5A2B] transition-colors cursor-pointer border-none"
                  >
                    Submit Another
                  </button>
                  {token && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-6 py-3 bg-white border border-[#eae8d8] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#f0ede0] transition-colors cursor-pointer"
                    >
                      View My Tickets
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#eae8d8] p-8 md:p-12 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-semibold text-black mb-1">Create a Support Request</h2>
                  <p className="text-sm text-gray-500">Describe your issue and we'll get back to you as soon as possible.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${errors.name ? 'border-red-400' : 'border-[#eae8d8]'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${errors.email ? 'border-red-400' : 'border-[#eae8d8]'}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Category *</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none cursor-pointer ${errors.category ? 'border-red-400' : 'border-[#eae8d8]'}`}
                      >
                        <option value="">Select a category...</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Priority</label>
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none cursor-pointer"
                      >
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="Brief summary of your issue"
                      className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none ${errors.subject ? 'border-red-400' : 'border-[#eae8d8]'}`}
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={6}
                      maxLength={5000}
                      placeholder="Please describe your issue in detail. Include order numbers, product names, or any relevant information..."
                      className={`w-full bg-[#fcfcfa] border px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none resize-y ${errors.description ? 'border-red-400' : 'border-[#eae8d8]'}`}
                    />
                    <div className="flex justify-between items-start mt-1">
                      {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
                      <span className="text-xs text-gray-400">{form.description.length}/5000</span>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">
                      Attachments <span className="text-gray-400 font-normal normal-case">(up to 3 images, max 5MB each)</span>
                    </label>
                    {attachments.length < 3 && (
                      <label className="flex items-center gap-2 px-4 py-3 bg-[#fcfcfa] border border-dashed border-[#c9c7b0] text-sm text-gray-500 cursor-pointer hover:bg-[#f0ede0] transition-colors w-fit">
                        <Upload className="w-4 h-4" />
                        <span>Choose file{attachments.length < 2 ? 's' : ''}</span>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-20 h-20 object-cover border border-[#eae8d8]"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs border-none cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-[#8B5A2B] text-white py-4 text-xs font-bold uppercase tracking-widest border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Support Request'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ── TICKET HISTORY ── */}
        {activeTab === 'history' && token && (
          <div className="space-y-4">
            <h2 className="text-base font-heading font-semibold text-black uppercase tracking-wider mb-6">My Support Tickets</h2>

            {ticketLoading ? (
              <TicketSkeleton />
            ) : ticketError ? (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-6">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{ticketError}</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white border border-[#eae8d8] p-16 text-center">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No support tickets yet.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-4 px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest border-none cursor-pointer hover:bg-[#8B5A2B] transition-colors"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t._id} className="bg-white border border-[#eae8d8] p-5 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#8B5A2B] font-bold">{t.ticketNumber}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${STATUS_COLORS[t.status] || 'bg-gray-100'}`}>
                              {t.status}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${PRIORITY_COLORS[t.priority] || 'bg-gray-100'}`}>
                              {t.priority}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-black">{t.subject}</p>
                          <p className="text-xs text-gray-500">{t.category} · {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      {t.adminNotes && (
                        <div className="mt-3 pt-3 border-t border-[#eae8d8]">
                          <p className="text-xs text-gray-500 italic"><strong>Support response:</strong> {t.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {ticketMeta && ticketMeta.pages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      disabled={ticketPage === 1}
                      onClick={() => setTicketPage((p) => p - 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {ticketPage} of {ticketMeta.pages}</span>
                    <button
                      disabled={ticketPage >= ticketMeta.pages}
                      onClick={() => setTicketPage((p) => p + 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Not logged in — nudge to login for ticket history */}
        {activeTab === 'history' && !token && (
          <div className="bg-white border border-[#eae8d8] p-16 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Please log in to view your ticket history.</p>
            <Link
              to="/account/login"
              className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#8B5A2B] transition-colors no-underline"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportRequest;
