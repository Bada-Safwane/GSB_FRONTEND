import React, { useState } from 'react'
import Navbar from '../components/common/Navbar'
import InvoiceList from '../components/dashboard/InvoiceList'
import NewInvoiceModal from '../components/dashboard/NewInvoiceModal'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import { useAuth } from '../contexts/AuthContext'
import { format, parseISO } from 'date-fns'

function Dashboard() {
  const { user } = useAuth()
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editInvoice, setEditInvoice] = useState(null)
  
  const handleCreateNew = () => {
    setEditInvoice(null)
    setIsNewInvoiceModalOpen(true)
  }
  
  const handleView = (invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }
  
  const handleEdit = (invoice) => {
    setEditInvoice(invoice)
    setIsNewInvoiceModalOpen(true)
  }
  
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy')
    } catch (e) {
      return dateString
    }
  }
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success-500 bg-opacity-10 text-success-500';
      case 'pending':
        return 'bg-warning-500 bg-opacity-10 text-warning-500';
      case 'overdue':
        return 'bg-error-500 bg-opacity-10 text-error-500';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Manage your invoices and track payments</p>
        </div>
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Pending</p>
            <h3 className="mt-1 text-2xl font-semibold text-warning-500">$4,590.00</h3>
            <p className="text-gray-500 text-sm mt-1">3 invoices</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Paid</p>
            <h3 className="mt-1 text-2xl font-semibold text-success-500">$7,950.00</h3>
            <p className="text-gray-500 text-sm mt-1">2 invoices</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Overdue</p>
            <h3 className="mt-1 text-2xl font-semibold text-error-500">$850.00</h3>
            <p className="text-gray-500 text-sm mt-1">1 invoice</p>
          </div>
        </div>
        
        <InvoiceList
          onCreateNew={handleCreateNew}
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>
      
      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        editInvoice={editInvoice}
      />
      
      {selectedInvoice && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Invoice Details"
          maxWidth="max-w-2xl"
          footer={
            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{selectedInvoice.clientName}</h3>
                <p className="text-gray-500 text-sm mt-1">Invoice #{selectedInvoice.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedInvoice.status)}`}>
                {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Issue Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.date)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Due Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>
            
            {selectedInvoice.description && (
              <div>
                <p className="text-gray-500 text-sm">Description</p>
                <p className="mt-1">{selectedInvoice.description}</p>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <p className="text-lg font-medium">Total Amount</p>
                <p className="text-lg font-semibold">${selectedInvoice.amount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-8 gap-3">
              <Button 
                variant="secondary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedInvoice)
                }}
              >
                Edit Invoice
              </Button>
              <Button>
                {selectedInvoice.status === 'paid' ? 'Download PDF' : 'Mark as Paid'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Dashboard