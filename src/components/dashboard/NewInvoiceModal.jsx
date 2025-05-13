import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { useInvoices } from '../../contexts/InvoiceContext'

function NewInvoiceModal({ isOpen, onClose, editInvoice = null }) {
  const { addInvoice, updateInvoice } = useInvoices()
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    amount: '',
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Due in 30 days
    status: 'pending',
    description: '',
  })
  const [errors, setErrors] = useState({})
  
  // If editing an existing invoice, populate the form
  useEffect(() => {
    if (editInvoice) {
      setFormData({
        clientName: editInvoice.clientName || '',
        clientEmail: editInvoice.clientEmail || '',
        amount: editInvoice.amount?.toString() || '',
        dueDate: editInvoice.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: editInvoice.status || 'pending',
        description: editInvoice.description || '',
      })
    } else {
      // Reset form when creating a new invoice
      setFormData({
        clientName: '',
        clientEmail: '',
        amount: '',
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'pending',
        description: '',
      })
    }
    setErrors({})
  }, [editInvoice, isOpen])
  
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }))
    
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: '',
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required'
    }
    
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const invoiceData = {
      ...formData,
      amount: parseFloat(formData.amount),
    }
    
    if (editInvoice) {
      updateInvoice(editInvoice.id, invoiceData)
    } else {
      addInvoice(invoiceData)
    }
    
    onClose()
  }
  
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        {editInvoice ? 'Update Invoice' : 'Create Invoice'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editInvoice ? 'Edit Invoice' : 'Create New Invoice'}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Client Name"
            id="clientName"
            placeholder="Enter client name"
            value={formData.clientName}
            onChange={handleChange}
            error={errors.clientName}
            required
          />
          
          <Input
            label="Client Email"
            type="email"
            id="clientEmail"
            placeholder="Enter client email"
            value={formData.clientEmail}
            onChange={handleChange}
            error={errors.clientEmail}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            id="amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            error={errors.amount}
            required
          />
          
          <Input
            label="Due Date"
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter invoice description or notes"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </form>
    </Modal>
  )
}

export default NewInvoiceModal