import React from 'react'
import { format, parseISO } from 'date-fns'
import { FiMoreVertical } from 'react-icons/fi'

function InvoiceItem({ invoice, onDelete, onView, onEdit }) {
  const { id, clientName, amount, date, status, dueDate } = invoice
  
  const getStatusClass = () => {
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

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="invoice-item flex items-center justify-between transition-all duration-200 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900">{clientName}</h3>
          <p className="text-sm text-gray-500">Invoice #{id}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-8">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-500">Issued</p>
          <p className="text-sm font-medium">{formatDate(date)}</p>
        </div>
        
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500">Due</p>
          <p className="text-sm font-medium">{formatDate(dueDate)}</p>
        </div>
        
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-base font-semibold">${amount.toFixed(2)}</p>
        </div>
        
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <FiMoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100">
            <button 
              onClick={() => onView(invoice)} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              View details
            </button>
            <button 
              onClick={() => onEdit(invoice)} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Edit invoice
            </button>
            <button 
              onClick={() => onDelete(invoice.id)} 
              className="w-full text-left px-4 py-2 text-sm text-error-500 hover:bg-gray-100 transition-colors duration-200"
            >
              Delete invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceItem