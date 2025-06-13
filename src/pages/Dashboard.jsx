import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import InvoiceList from '../components/dashboard/InvoiceList';
import NewInvoiceModal from '../components/dashboard/NewInvoiceModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';

function Dashboard() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);

  const fetchInvoices = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/bills', {
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
      const response = await fetch(`http://localhost:3000/bills/${id}`, {
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
      case 'paid':
      case 'payé':
        return 'bg-success-500 bg-opacity-10 text-success-500';
      case 'pending':
      case 'en attente':
        return 'bg-warning-500 bg-opacity-10 text-warning-500';
      case 'overdue':
      case 'en cours':
        return 'bg-error-500 bg-opacity-10 text-error-500';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  if (!token) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {user?.name || 'User'}</h1>
          <p className="text-gray-600">Gérez vos notes de frais et suivez vos dépenses</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-${user?.role === 'admin' ? '4' : '3'} gap-4 mb-10`}>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-sm text-gray-500">En cours</p>
            <p className="text-2xl font-bold text-error-500">
              {filteredInvoices.filter(inv => inv.status === 'en cours').length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-warning-500">
              {filteredInvoices.filter(inv => inv.status === 'en attente').length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-sm text-gray-500">Payé</p>
            <p className="text-2xl font-bold text-success-500">
              {filteredInvoices.filter(inv => inv.status === 'payé').length}
            </p>
          </div>

          {user?.role === 'admin' && (
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Montant total</p>
              <p className="text-2xl font-bold text-primary-500">
                {totalAmount.toFixed(2)} €
              </p>
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
        />
      </div>

      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        editInvoice={editInvoice}
        onInvoiceSaved={fetchInvoices}
      />

      {selectedInvoice && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Détails de la note"
          maxWidth="max-w-2xl"
          footer={
            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{selectedInvoice.clientName || 'Invoice ID'}</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedInvoice._id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedInvoice.status)}`}>
                {selectedInvoice.status?.charAt(0).toUpperCase() + selectedInvoice.status?.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Date de création</p>
                <p className="font-medium">{formatDate(selectedInvoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date de facturation</p>
                <p className="font-medium">{formatDate(selectedInvoice.date)}</p>
              </div>
            </div>

            {selectedInvoice.description && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Description</p>
                  <p className="mt-1">{selectedInvoice.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Aperçu :</p>
                  <img
                    src={selectedInvoice.proof}
                    alt="Justificatif"
                    className="rounded-md max-h-48 object-contain border border-gray-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <p className="text-lg font-medium">Coût total</p>
                <p className="text-lg font-semibold">€{selectedInvoice.amount.toFixed(2)}</p>
              </div>
            </div>

            {user?.role === 'admin' && selectedInvoice.userEmail && (
              <div className="mt-4">
                <p className="text-gray-500 text-sm">Email de l'auteur</p>
                <p className="font-medium">{selectedInvoice.userEmail}</p>
              </div>
            )}

            <div className="flex justify-end mt-8 gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedInvoice);
                }}
              >
                Modifier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
