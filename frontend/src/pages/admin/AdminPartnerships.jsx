import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, ChevronDown, RefreshCw, X } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { partnerService } from '../../api/partnerService';
import Loader from '../../components/ui/Loader';

const STATUS_OPTIONS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];
const TYPE_OPTIONS = ['All', 'Distributor', 'Wholesale', 'Influencer', 'Affiliate', 'Vendor'];

const STATUS_COLOR = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const AdminPartnerships = () => {
  useDocumentTitle('Admin - Partnerships');
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partnerService.adminGetAll({
        page,
        limit: 20,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
      });
      if (res.success) {
        setApplications(res.data?.applications || []);
        setPagination(res.data || null);
      } else {
        showToast(res.message || 'Failed to load applications', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, showToast]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const openDetail = (app) => {
    setSelected(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await partnerService.adminUpdateStatus(selected._id, {
        status: newStatus,
        adminNotes,
      });
      if (res.success) {
        showToast('Application updated', 'success');
        setSelected(null);
        fetchApps();
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
    if (!window.confirm('Permanently delete this application?')) return;
    try {
      const res = await partnerService.adminDelete(id);
      if (res.success) {
        showToast('Application deleted', 'success');
        if (selected?._id === id) setSelected(null);
        fetchApps();
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-black uppercase tracking-wider">Partnership Applications</h3>
          <p className="text-xs text-gray-400 mt-1">Review and manage incoming partnership requests</p>
        </div>
        <button onClick={fetchApps} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black bg-transparent border-none cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-[#fcfcfa] border border-[#eae8d8] p-4">
        {[
          { label: 'Status', value: statusFilter, setter: setStatusFilter, options: STATUS_OPTIONS },
          { label: 'Type', value: typeFilter, setter: setTypeFilter, options: TYPE_OPTIONS },
        ].map(({ label, value, setter, options }) => (
          <div key={label} className="relative">
            <select value={value} onChange={(e) => { setter(e.target.value); setPage(1); }} className="bg-white border border-[#eae8d8] px-3 py-2 text-xs text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none pr-8 cursor-pointer">
              {options.map((o) => <option key={o} value={o}>{label}: {o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black">
              <tr>
                <th className="p-4">Business</th>
                <th className="p-4">Type</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {applications.map((a) => (
                <tr key={a._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-black">{a.businessName}</p>
                    {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#8B5A2B] hover:underline truncate max-w-[160px] block">{a.website}</a>}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f0ede0] text-[#8B5A2B]">{a.type}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-black">{a.contactName}</p>
                    <p className="text-gray-400 text-[10px]">{a.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${STATUS_COLOR[a.status] || 'bg-gray-100 text-gray-500'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openDetail(a)} className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(a._id)} className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan="6" className="p-12 text-center italic text-gray-400">No applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-xs font-bold border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] disabled:opacity-40 cursor-pointer uppercase tracking-widest">Previous</button>
          <span className="text-xs text-gray-500">Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-xs font-bold border border-[#eae8d8] bg-white text-black hover:bg-[#f0ede0] disabled:opacity-40 cursor-pointer uppercase tracking-widest">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white border border-[#eae8d8] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#eae8d8] sticky top-0 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f0ede0] text-[#8B5A2B] mr-3">{selected.type}</span>
                <span className="font-heading font-semibold text-black text-base">{selected.businessName}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-gray-400 uppercase tracking-wider">Contact</span><p className="text-black font-medium mt-1">{selected.contactName}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Email</span><p className="text-black font-medium mt-1">{selected.email}</p></div>
                {selected.phone && <div><span className="text-gray-400 uppercase tracking-wider">Phone</span><p className="text-black font-medium mt-1">{selected.phone}</p></div>}
                {selected.website && <div><span className="text-gray-400 uppercase tracking-wider">Website</span><a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-[#8B5A2B] hover:underline font-medium mt-1 block">{selected.website}</a></div>}
              </div>

              {/* Dynamic Fields */}
              {selected.dynamicFields?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] block mb-3">{selected.type} Details</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.dynamicFields.map((f, i) => (
                      <div key={i} className="bg-[#fcfcfa] border border-[#eae8d8] p-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{f.label}</span>
                        <p className="text-sm text-black font-medium mt-0.5">{f.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.message && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Message</span>
                  <p className="text-sm text-black bg-[#fcfcfa] border border-[#eae8d8] p-4 whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-[#eae8d8] pt-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Update Application</span>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2.5 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none appearance-none cursor-pointer">
                    {['Pending', 'Under Review', 'Approved', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Admin Notes</label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Internal notes about this application..." className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2 text-sm text-black focus:outline-none focus:border-[#8B5A2B] rounded-none resize-none" />
                </div>
                <button onClick={handleUpdateStatus} disabled={updating} className="w-full bg-[#2f3e10] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-widest border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
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

export default AdminPartnerships;
