import { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiMoreVertical } from 'react-icons/fi';
import PropTypes from 'prop-types';
import DropdownMenuPortal from '../dashboard/DropdownMenuPortal';
import { useAuth } from '../../contexts/AuthContext'


function InvoiceItem({ invoice, onDelete, onView, onEdit }) {
  const { _id, amount, date, status, createdAt, userEmail, type } = invoice;
  const { user } = useAuth()

  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const getStatusClass = () => {
    switch (status) {
      case 'payé':
        return 'bg-green-100 text-green-600';
      case 'en cours':
        return 'bg-red-100 text-red-600';
      case 'en attente':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateInput) => {
    try {
      const date =
        typeof dateInput === 'number' || /^\d{13}$/.test(dateInput)
          ? new Date(Number(dateInput))
          : parseISO(dateInput)

      return format(date, 'dd/MM/yyyy')
    } catch {
      return dateInput
    }
  }

  return (
    <div className="invoice-item flex items-center justify-between transition-all duration-200 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900">{type || 'Invoice'}</h3>
          <p className="text-sm text-gray-500">ID: {_id}</p>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="text-left hidden sm:block">
          <p className="text-sm text-gray-500">Utilisateur</p>
          <p className="text-sm font-medium">{formatDate(userEmail)}</p>
        </div>
      )}
        
      <div className="flex items-center space-x-8">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-500">Date de création</p>
          <p className="text-sm font-medium">{formatDate(createdAt)}</p>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500">Date de facture</p>
          <p className="text-sm font-medium">{formatDate(date)}</p>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status}
          </span>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Montant</p>
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
                Voir details
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit(invoice);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Modifier la note
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(_id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Supprimer la note
              </button>
            </DropdownMenuPortal>
          )}
        </div>
      </div>
    </div>

  );
}

InvoiceItem.propTypes = {
  invoice: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    proof: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default InvoiceItem;
