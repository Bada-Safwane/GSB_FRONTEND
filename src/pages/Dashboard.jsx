import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import InvoiceList from '../components/dashboard/InvoiceList';
import NewInvoiceModal from '../components/dashboard/NewInvoiceModal';
import PhotoPreviewModal from '../components/dashboard/PhotoPreviewModal';
import RejectionReasonModal from '../components/dashboard/RejectionReasonModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

function Dashboard() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null); // { type: 'single'|'bulk', id?: string }
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  const fetchInvoices = async () => {
    if (!token) return;

    try {
      const response = await fetch('https://gsb-backend-nti4.onrender.com/bills', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data);
      setFilteredInvoices(data); // Initialiser avec toutes les factures
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const handleCreateNew = () => {
    setEditInvoice(null);
    setIsNewInvoiceModalOpen(true);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleEdit = (invoice) => {
    setEditInvoice(invoice);
    setIsNewInvoiceModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!token) return;

    try {
      const response = await fetch(`https://gsb-backend-nti4.onrender.com/bills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      setInvoices(prev => prev.filter(inv => inv._id !== id));
      setFilteredInvoices(prev => prev.filter(inv => inv._id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const formatDate = (dateInput) => {
    try {
      const date =
        typeof dateInput === 'number' || /^\d{13}$/.test(dateInput)
          ? new Date(Number(dateInput))
          : parseISO(dateInput);

      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateInput;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Remboursée':
        return 'bg-emerald-50 text-emerald-700';
      case 'Validée':
        return 'bg-green-50 text-green-700';
      case 'Refusée':
        return 'bg-red-50 text-red-700';
      case 'Soumise':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handlePhotoPreview = (invoice) => {
    setPreviewInvoice(invoice);
    setIsPhotoPreviewOpen(true);
  };

  const handleStatusChange = async (id, newStatus, rejectionReason = null) => {
    if (!token) return;

    // Si on refuse, ouvrir la popup de raison
    if (newStatus === 'Refusée' && !rejectionReason) {
      setRejectionTarget({ type: 'single', id });
      return;
    }

    try {
      const body = { status: newStatus };
      if (rejectionReason) body.rejectionReason = rejectionReason;
      if (newStatus !== 'Refusée') body.rejectionReason = null;

      const response = await fetch(`https://gsb-backend-nti4.onrender.com/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus, rejectionReason: rejectionReason || null } : inv));
      setFilteredInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus, rejectionReason: rejectionReason || null } : inv));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRejectionConfirm = async (reason) => {
    setRejectionLoading(true);
    try {
      if (rejectionTarget.type === 'single') {
        await handleStatusChange(rejectionTarget.id, 'Refusée', reason);
      } else if (rejectionTarget.type === 'bulk') {
        // Bulk reject with reason — update each one individually for the reason
        for (const id of selectedIds) {
          await fetch(`https://gsb-backend-nti4.onrender.com/bills/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'Refusée', rejectionReason: reason }),
          });
        }
        setInvoices(prev => prev.map(inv =>
          selectedIds.includes(inv._id) ? { ...inv, status: 'Refusée', rejectionReason: reason } : inv
        ));
        setFilteredInvoices(prev => prev.map(inv =>
          selectedIds.includes(inv._id) ? { ...inv, status: 'Refusée', rejectionReason: reason } : inv
        ));
        setSelectedIds([]);
      }
      setRejectionTarget(null);
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setRejectionLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids) => {
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!token || selectedIds.length === 0) return;

    // Si refus en masse, ouvrir la popup de raison
    if (newStatus === 'Refusée') {
      setRejectionTarget({ type: 'bulk' });
      return;
    }

    setStatusUpdateLoading(true);
    try {
      const response = await fetch('https://gsb-backend-nti4.onrender.com/bills/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to bulk update');

      setInvoices(prev => prev.map(inv =>
        selectedIds.includes(inv._id) ? { ...inv, status: newStatus } : inv
      ));
      setFilteredInvoices(prev => prev.map(inv =>
        selectedIds.includes(inv._id) ? { ...inv, status: newStatus } : inv
      ));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyReimbursed = filteredInvoices
    .filter(inv => {
      if (inv.status !== 'Remboursée') return false;
      const ts = Number(inv.createdAt);
      if (!ts) return false;
      const d = new Date(ts);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (!token) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {user?.firstName} {user?.lastName}</h1>
          <p className="text-gray-600">Gérez vos notes de frais et suivez vos dépenses</p>
        </div>

  <div
  className={`grid grid-cols-1 gap-4 mb-8 ${
    isAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
  }`}
>
  <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-blue-50">
      <FiClock className="w-6 h-6 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Soumises</p>
      <p className="text-2xl font-bold text-gray-900">
        {filteredInvoices.filter(inv => inv.status === 'Soumise').length}
      </p>
    </div>
  </div>
  <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-green-50">
      <FiCheckCircle className="w-6 h-6 text-green-500" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Validées</p>
      <p className="text-2xl font-bold text-gray-900">
        {filteredInvoices.filter(inv => inv.status === 'Validée').length}
      </p>
    </div>
  </div>
  {isAdmin ? (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-red-50">
        <FiAlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Refusées</p>
        <p className="text-2xl font-bold text-gray-900">
          {filteredInvoices.filter(inv => inv.status === 'Refusée').length}
        </p>
      </div>
    </div>
  ) : (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-emerald-50">
        <FiCheckCircle className="w-6 h-6 text-emerald-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Remboursées</p>
        <p className="text-2xl font-bold text-gray-900">
          {filteredInvoices.filter(inv => inv.status === 'Remboursée').length}
        </p>
      </div>
    </div>
  )}
  {isAdmin && (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-blue-50">
        <FiTrendingUp className="w-6 h-6 text-blue-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Remboursé ce mois</p>
        <p className="text-2xl font-bold text-gray-900">
          {monthlyReimbursed.toFixed(2)} €
        </p>
      </div>
    </div>
  )}
</div>


        <InvoiceList
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFilterChange={setFilteredInvoices}
          onPhotoPreview={handlePhotoPreview}
          onStatusChange={handleStatusChange}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onBulkStatusChange={handleBulkStatusChange}
        />
      </div>

      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        editInvoice={editInvoice}
        onInvoiceSaved={fetchInvoices}
      />

      <PhotoPreviewModal
        isOpen={isPhotoPreviewOpen}
        onClose={() => setIsPhotoPreviewOpen(false)}
        imageUrl={previewInvoice?.proof}
        title={previewInvoice?.type || 'Justificatif'}
      />

      {selectedInvoice && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Détails de la note"
          maxWidth="max-w-2xl"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Fermer
              </Button>
              {(isSuperAdmin || (!isAdmin && selectedInvoice.status === 'Soumise')) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedInvoice);
                  }}
                >
                  Modifier
                </Button>
              )}
              {isAdmin && selectedInvoice.status === 'Soumise' && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleStatusChange(selectedInvoice._id, 'Validée');
                    setSelectedInvoice(prev => ({ ...prev, status: 'Validée' }));
                  }}
                >
                  Valider
                </Button>
              )}
              {isAdmin && selectedInvoice.status === 'Validée' && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedInvoice._id, 'Remboursée');
                    setSelectedInvoice(prev => ({ ...prev, status: 'Remboursée' }));
                  }}
                >
                  Rembourser
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedInvoice.type || 'Facture'}</h3>
                <p className="text-gray-400 text-xs mt-1 font-mono">{selectedInvoice._id}</p>
              </div>
              {isAdmin ? (
                <select
                  value={selectedInvoice.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleStatusChange(selectedInvoice._id, newStatus);
                    setSelectedInvoice(prev => ({ ...prev, status: newStatus }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${getStatusClass(selectedInvoice.status)}`}
                >
                  <option value="Soumise">Soumise</option>
                  <option value="Validée">Validée</option>
                  <option value="Refusée">Refusée</option>
                  <option value="Remboursée">Remboursée</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedInvoice.status)}`}>
                  {selectedInvoice.status?.charAt(0).toUpperCase() + selectedInvoice.status?.slice(1)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date de création</p>
                <p className="font-medium text-gray-800">{formatDate(selectedInvoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date de facturation</p>
                <p className="font-medium text-gray-800">{formatDate(selectedInvoice.date)}</p>
              </div>
            </div>

            {selectedInvoice.description && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Description</p>
                <p className="mt-1 text-gray-700">{selectedInvoice.description}</p>
              </div>
            )}

            {selectedInvoice.status === 'Refusée' && selectedInvoice.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-xs uppercase tracking-wider font-medium mb-1">Raison du refus</p>
                <p className="text-red-700 text-sm">{selectedInvoice.rejectionReason}</p>
              </div>
            )}

            {selectedInvoice.proof && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Justificatif</p>
                <div
                  className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer group"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handlePhotoPreview(selectedInvoice);
                  }}
                >
                  <img
                    src={selectedInvoice.proof}
                    alt="Justificatif"
                    className="w-full max-h-56 object-contain"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-opacity">
                      Agrandir
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium text-gray-600">Coût total</p>
                <p className="text-2xl font-bold text-gray-900">€{selectedInvoice.amount.toFixed(2)}</p>
              </div>
            </div>

            {isAdmin && selectedInvoice.userEmail && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Email de l'auteur</p>
                <p className="font-medium text-gray-800">{selectedInvoice.userEmail}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
