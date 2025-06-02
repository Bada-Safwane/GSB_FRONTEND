import React, { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiMoreVertical } from 'react-icons/fi';
import DropdownMenuPortal from '../dashboard/DropdownMenuPortal';

function InvoiceItem({ invoice, onDelete, onView, onEdit }) {
  const { _id, clientName, amount, date, status, createdAt } = invoice;

  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const getStatusClass = () => {
    switch (status) {
      case 'Payé':
        return 'bg-green-100 text-green-600';
      case 'en cours':
        return 'bg-red-100 text-red-600';
      case 'en attente':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="invoice-item flex items-center justify-between transition-all duration-200 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900">{clientName || 'Invoice ID'}</h3>
          <p className="text-sm text-gray-500">{_id}</p>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-500">Issued</p>
          <p className="text-sm font-medium">{formatDate(createdAt)}</p>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500">Due</p>
          <p className="text-sm font-medium">{formatDate(date)}</p>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status}
          </span>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-base font-semibold">€{amount.toFixed(2)}</p>
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {open && (
            <DropdownMenuPortal triggerRef={buttonRef} onClose={() => setOpen(false)}>
              <button
                onClick={() => {
                  setOpen(false);
                  onView(invoice);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View details
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit(invoice);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit invoice
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(_id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete invoice
              </button>
            </DropdownMenuPortal>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceItem;
