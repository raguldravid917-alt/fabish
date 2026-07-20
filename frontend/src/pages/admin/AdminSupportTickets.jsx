import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Search, Eye, X, Trash2, ChevronDown, RefreshCw, MessageSquare } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { supportService } from '../../api/supportService';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
const CATEGORY_OPTIONS = ['All', 'Order Issue', 'Product Quality', 'Shipping', 'Return & Refund', 'Payment', 'Account', 'Other'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Urgent'];

const STATUS_COLOR = {
  Open: 'blue',
  'In Progress': 'yellow',
  Resolved: 'green',
  Closed: 'gray',
};
const PRIORITY_COLOR = { Low: 'gray', Medium: 'blue', High: 'orange', Urgent: 'red' };

const AdminSupportTickets = () => {
  useDocumentTitle('Admin - Support Tickets');
  const { showToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [selected, setSelected] = useState(null); // ticket detail modal
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supportService.adminGetAll({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      });
      if (res.success) {
        setTickets(res.data?.tickets || []);
        setPagination(res.data || null);
      } else {
        showToast(res.message || 'Failed to load tickets', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter, priorityFilter, showToast]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openDetail = (ticket) => {
    setSelected(ticket);
    setStatusUpdate(ticket.status);
    setAdminNote(ticket.adminNotes || '');
    setReplyMessage('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await supportService.adminUpdateStatus(selected._id, {
        status: statusUpdate,
        adminNotes: adminNote,
        replyMessage: replyMessage || undefined,
      });
      if (res.success) {
        showToast('Ticket updated successfully', 'success');
        setSelected(null);
        fetchTickets();
      } else {
        showToast(res.message || 'Update failed', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    try {
      const res = await supportService.adminDelete(id);
      if (res.success) {
        showToast('Ticket deleted', 'success');
        if (selected?._id === id) setSelected(null);
        fetchTickets();
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-black uppercase tracking-wider">Support Tickets</h3>
          <p className="text-xs text-gray-400 mt-1">Manage customer support requests and inquiries</p>
        </div>
        <button onClick={fetchTickets} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black bg-transparent border-none cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-[#fcfcfa] border border-[#eae8d8] p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tickets..."
            className="w-full bg-white border border-[#eae8d8] pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-[#8B5A2B] rounded-none"
          />
        </div>
        {[
          { label: 'Status', value: statusFilter, setter: setStatusFilter, options: STATUS_OPTIONS },
          { label: 'Category', value: categoryFilter, setter: setCategoryFilter, options: CATEGORY_OPTIONS },
          { label: 'Priority', value: priorityFilter, setter: setPriorityFilter, options: PRIORITY_OPTIONS },
        ].map(({ label, value, setter, options }) => (
          <div key={label} className="relative">
            <select
              value={value}
              onChange={(e) => { setter(e.target.value); setPage(1); }}
              className="bg-white border border-[#eae8d8] px-3 py-2 text-xs text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none pr-8 cursor-pointer"
            >
              {options.map((o) => <option key={o} value={o}>{label}: {o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black">
              <tr>
                <th className="p-4">Ticket #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {tickets.map((t) => (
                <tr key={t._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                  <td className="p-4 font-mono text-[#8B5A2B] font-bold">{t.ticketNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-black">{t.name}</p>
                    <p className="text-gray-400 text-[10px]">{t.email}</p>
                  </td>
                  <td className="p-4 max-w-[200px] truncate text-black">{t.subject}</td>
                  <td className="p-4 text-gray-500">{t.category}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-${PRIORITY_COLOR[t.priority] || 'gray'}-100 text-${PRIORITY_COLOR[t.priority] || 'gray'}-700`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${t.status === 'Open' ? 'bg-blue-100 text-blue-700' : t.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : t.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openDetail(t)} className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="8" className="p-12 text-center italic text-gray-400">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-xs font-bold border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] disabled:opacity-40 cursor-pointer uppercase tracking-widest">
            Previous
          </button>
          <span className="text-xs text-gray-500">Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-xs font-bold border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] disabled:opacity-40 cursor-pointer uppercase tracking-widest">
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white border border-[#eae8d8] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#eae8d8] sticky top-0 bg-white">
              <div>
                <p className="font-mono text-[#8B5A2B] font-bold text-sm">{selected.ticketNumber}</p>
                <h3 className="font-heading font-semibold text-black text-base">{selected.subject}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-gray-400 uppercase tracking-wider">Name</span><p className="text-black font-medium mt-1">{selected.name}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Email</span><p className="text-black font-medium mt-1">{selected.email}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Category</span><p className="text-black font-medium mt-1">{selected.category}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Priority</span><p className="text-black font-medium mt-1">{selected.priority}</p></div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</span>
                <p className="text-sm text-black mt-2 leading-relaxed whitespace-pre-wrap bg-[#fcfcfa] border border-[#eae8d8] p-4">{selected.description}</p>
              </div>

              {/* Attachments */}
              {selected.attachments?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Attachments</span>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {selected.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer">
                        <img src={a.url} alt={a.filename || `attachment-${i+1}`} className="w-20 h-20 object-cover border border-[#eae8d8] hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies */}
              {selected.replies?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Conversation</span>
                  <div className="mt-2 space-y-2">
                    {selected.replies.map((r) => (
                      <div key={r._id} className={`p-3 text-xs ${r.isAdmin ? 'bg-[#f0ede0] border-l-2 border-[#8B5A2B]' : 'bg-gray-50 border-l-2 border-gray-300'}`}>
                        <p className="font-bold mb-1">{r.isAdmin ? `${r.author} (Support)` : 'Customer'}</p>
                        <p className="text-gray-700">{r.message}</p>
                        <p className="text-gray-400 text-[10px] mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Form */}
              <div className="border-t border-[#eae8d8] pt-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Update Ticket</span>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Status</label>
                    <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2.5 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none cursor-pointer">
                      {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Reply to Customer <span className="text-gray-400 font-normal normal-case">(will be emailed)</span></label>
                    <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={3}
                      placeholder="Type your response..."
                      className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Internal Admin Notes</label>
                    <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2}
                      placeholder="Internal notes (not visible to customer)..."
                      className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none resize-none" />
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="w-full bg-[#2f3e10] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-widest border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
