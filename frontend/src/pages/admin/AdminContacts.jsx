/**
 * AdminContacts — Customer inquiry management page.
 *
 * Implements interactive contact management with database integration.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Mail, Search, Trash2, Eye, Check, RotateCcw, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { contactService } from '../../api/contactService';
import AdminPageHeader from '../../components/ui/AdminPageHeader';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';

const ITEMS_PER_PAGE = 10;

const AdminContacts = () => {
  useDocumentTitle('Admin - Inquiries');
  const { showToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Fetch inquiries from backend
  const fetchContacts = useCallback(async (showIndicator = false) => {
    if (showIndicator) setRefreshing(true);
    try {
      const res = await contactService.getAll();
      if (res.success) {
        setContacts(res.data || []);
      } else {
        showToast(res.message || 'Failed to fetch inquiries', 'error');
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      showToast('Connection failed. Could not load inquiries.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Setup initial fetch and periodic auto-refresh polling (every 15 seconds)
  useEffect(() => {
    fetchContacts();

    const interval = setInterval(() => {
      fetchContacts(false); // poll in background without overlay spinner
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchContacts]);

  // Handle Mark as Read / Unread status change
  const handleStatusChange = async (id, status) => {
    try {
      const res = await contactService.updateStatus(id, status);
      if (res.success) {
        showToast(`Inquiry marked as ${status === 'Pending' ? 'Unread' : 'Read'} successfully.`, 'success');
        // Update local state directly
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status } : c))
        );
        // If modal is open, update selectedInquiry state to match
        if (selectedInquiry?._id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status }));
        }
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Connection failed. Could not update status.', 'error');
    }
  };

  // Handle Delete Inquiry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry? This action is irreversible.')) {
      return;
    }
    try {
      const res = await contactService.delete(id);
      if (res.success) {
        showToast('Inquiry deleted successfully.', 'success');
        setContacts((prev) => prev.filter((c) => c._id !== id));
        if (selectedInquiry?._id === id) {
          setSelectedInquiry(null);
        }
      } else {
        showToast(res.message || 'Failed to delete inquiry', 'error');
      }
    } catch (err) {
      showToast('Connection failed. Could not delete inquiry.', 'error');
    }
  };

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  // Reset page number on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE));
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // Helper mapping status to badge variants
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Resolved':
        return 'success';
      case 'Reviewed':
        return 'info';
      case 'Pending':
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <AdminPageHeader
          title="Customer Inquiries"
          subtitle={`${filteredContacts.length} contact form submission${filteredContacts.length !== 1 ? 's' : ''} found`}
        />
        <button
          onClick={() => fetchContacts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-heading font-bold uppercase tracking-widest bg-white border border-[#eae8d8] text-black hover:bg-gray-50 transition-colors disabled:opacity-50 h-10 w-fit cursor-pointer rounded-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'REFRESHING...' : 'REFRESH'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-[#eae8d8] p-4 select-none">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search inquiries by sender, email or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] pl-10 pr-4 py-2.5 font-body text-xs text-black focus:outline-none focus:border-[#729855] rounded-none"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-3 py-2.5 font-heading text-[10px] font-bold uppercase tracking-wider text-[#555] focus:outline-none focus:border-[#729855] rounded-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending / Unread</option>
            <option value="Reviewed">Reviewed / Read</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader />
        </div>
      ) : (
        <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
              <tr>
                <th className="p-4">Sender</th>
                <th className="p-4">Email</th>
                <th className="p-4">Message Preview</th>
                <th className="p-4">Status</th>
                <th className="p-4">Received At</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/40">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center gap-3">
                      <Mail className="w-10 h-10 text-gray-200" />
                      <span>No customer inquiries found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((c) => (
                  <tr
                    key={c._id}
                    className={`hover:bg-[#eae8d8]/10 transition-colors text-xs cursor-pointer ${
                      c.status === 'Pending' ? 'font-bold bg-[#729855]/5' : ''
                    }`}
                    onClick={() => setSelectedInquiry(c)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0 ${
                          c.status === 'Pending' ? 'bg-[#2f3e10] text-white' : 'bg-[#eae8d8] text-[#2f3e10]'
                        }`}>
                          {c.name?.slice(0, 2) || '??'}
                        </div>
                        <span className="text-black">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-500 select-text" onClick={(e) => e.stopPropagation()}>
                      {c.email}
                    </td>
                    <td className="p-4 text-gray-700 font-medium max-w-xs" title={c.message}>
                      <span className="block truncate">{c.message}</span>
                    </td>
                    <td className="p-4 select-none">
                      <Badge variant={getStatusVariant(c.status)}>
                        {c.status === 'Pending' ? 'Unread' : c.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-400 font-mono whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="p-4 text-center flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedInquiry(c)}
                        className="p-2 border border-brand-border text-brand-charcoal hover:bg-brand-gray-light transition-all cursor-pointer bg-white rounded-none"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(c._id, c.status === 'Pending' ? 'Reviewed' : 'Pending')}
                        className={`p-2 border transition-all cursor-pointer rounded-none ${
                          c.status === 'Pending'
                            ? 'border-green-200 text-green-600 hover:bg-green-50'
                            : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        }`}
                        title={c.status === 'Pending' ? 'Mark as Read' : 'Mark as Unread'}
                      >
                        {c.status === 'Pending' ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-white rounded-none"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredContacts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-[#eae8d8] pt-4 select-none font-heading">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 border border-[#eae8d8] bg-white text-black hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer rounded-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#eae8d8] bg-white text-black hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer rounded-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fcfcfa] border border-[#eae8d8] shadow-2xl max-w-lg w-full text-left relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eae8d8] flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">INQUIRY DETAIL</span>
                <h4 className="serif-title text-lg text-black uppercase font-medium tracking-wide">
                  {selectedInquiry.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
                  <span className="text-xs font-mono text-black select-text break-all font-semibold">
                    {selectedInquiry.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Received Date</span>
                  <span className="text-xs font-mono text-black font-semibold">
                    {new Date(selectedInquiry.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Status</span>
                <Badge variant={getStatusVariant(selectedInquiry.status)}>
                  {selectedInquiry.status === 'Pending' ? 'Unread' : selectedInquiry.status}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Message</span>
                <div className="bg-[#faf9f5] border border-[#eae8d8] p-4 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[30vh] overflow-y-auto select-text font-medium italic">
                  "{selectedInquiry.message}"
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#eae8d8] bg-gray-50/50 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleStatusChange(selectedInquiry._id, selectedInquiry.status === 'Pending' ? 'Reviewed' : 'Pending')}
                className={`px-4 py-2.5 font-heading font-bold text-[10px] uppercase tracking-widest border transition-all cursor-pointer rounded-none flex items-center gap-1.5 ${
                  selectedInquiry.status === 'Pending'
                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600'
                    : 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white hover:border-orange-600'
                }`}
              >
                {selectedInquiry.status === 'Pending' ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {selectedInquiry.status === 'Pending' ? 'Mark as Read' : 'Mark as Unread'}
              </button>
              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="px-4 py-2.5 font-heading font-bold text-[10px] uppercase tracking-widest border border-red-300 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer rounded-none flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2.5 font-heading font-bold text-[10px] uppercase tracking-widest border border-gray-300 bg-white text-black hover:bg-gray-100 transition-all cursor-pointer rounded-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
