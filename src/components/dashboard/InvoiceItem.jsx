import { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiMoreVertical, FiImage, FiCheck, FiX, FiClock, FiDollarSign, FiRotateCcw } from 'react-icons/fi';
import PropTypes from 'prop-types';
import DropdownMenuPortal from '../dashboard/DropdownMenuPortal';
import { useAuth } from '../../contexts/AuthContext'


function InvoiceItem({ invoice, onDelete, onView, onEdit, onPhotoPreview, onStatusChange, isSelected, onSelect }) {
  const { _id, amount, date, status, createdAt, userEmail, userName, type, proof, rejectionReason } = invoice;
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const getStatusClass = () => {
    switch (status) {
      case 'Remboursée':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'Validée':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
      case 'Refusée':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
      case 'Soumise':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Remboursée':
      case 'Validée':
        return <FiCheck className="w-3 h-3" />;
      case 'Refusée':
        return <FiX className="w-3 h-3" />;
      case 'Soumise':
        return <FiClock className="w-3 h-3" />;
      default:
        return null;
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

  const handleQuickStatus = async (newStatus) => {
    if (statusLoading) return;
    setStatusLoading(true);
    try {
      await onStatusChange(_id, newStatus);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className={`group flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-gray-50 ${isSelected ? 'bg-primary-50 hover:bg-primary-50' : ''}`}>
      {/* Left section: checkbox + info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Checkbox for bulk select (admin only) */}
        {isAdmin && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={() => onSelect(_id)}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer flex-shrink-0"
          />
        )}

        {/* Photo thumbnail / preview button */}
        <button
          onClick={() => onPhotoPreview(invoice)}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group/photo relative overflow-hidden"
          title="Voir le justificatif"
        >
          {proof ? (
            <>
              <img
                src={proof}
                alt=""
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-all" style={{ display: 'none' }}>
                <FiImage className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <FiImage className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{type || 'Facture'}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{_id}</p>
        </div>
      </div>

      {/* Middle section: metadata */}
      <div className="hidden lg:flex items-center gap-8 flex-shrink-0 px-4">
        {isAdmin && (
          <div className="text-left w-40">
            <p className="text-sm font-medium text-gray-700 truncate">{userName && userName !== userEmail && !userName.includes('undefined') ? userName : userEmail}</p>
            {userName && userName !== userEmail && !userName.includes('undefined') && (
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            )}
          </div>
        )}

        <div className="text-left w-28">
          <p className="text-sm font-medium text-gray-700">{formatDate(createdAt)}</p>
        </div>

        <div className="text-left w-28">
          <p className="text-sm font-medium text-gray-700">{formatDate(date)}</p>
        </div>

        <div className="w-28 flex items-center">
          <span className={`inline-flex items-center justify-center gap-1 w-full px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass()}`}>
            {getStatusIcon()}
            {status}
          </span>
        </div>
      </div>

      {/* Right section: amount + actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right w-24">
          <p className="text-base font-bold text-gray-900">€{amount.toFixed(2)}</p>
        </div>

        {/* Quick status actions for admin */}
        {isAdmin && (
          <div className="hidden sm:flex items-center justify-center gap-1 w-20">
            {status === 'Soumise' && (
              <>
                <button
                  onClick={() => handleQuickStatus('Validée')}
                  disabled={statusLoading}
                  className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                  title="Valider"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleQuickStatus('Refusée')}
                  disabled={statusLoading}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  title="Refuser"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </>
            )}
            {status === 'Validée' && (
              <>
                <button
                  onClick={() => handleQuickStatus('Remboursée')}
                  disabled={statusLoading}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  title="Rembourser"
                >
                  <FiDollarSign className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleQuickStatus('Refusée')}
                  disabled={statusLoading}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  title="Refuser"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </>
            )}
            {status === 'Refusée' && (
              <button
                onClick={() => handleQuickStatus('Soumise')}
                disabled={statusLoading}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                title="Remettre en attente"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown menu */}
        <div className="relative w-10 flex items-center justify-center">
          <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {open && (
            <DropdownMenuPortal triggerRef={buttonRef} onClose={() => setOpen(false)}>
              <button
                onClick={() => {
                  setOpen(false);
                  onPhotoPreview(invoice);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiImage className="w-4 h-4" />
                Voir le justificatif
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onView(invoice);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiMoreVertical className="w-4 h-4" />
                Voir détails
              </button>
              {(isSuperAdmin || (!isAdmin && status === 'Soumise')) && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onEdit(invoice);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  Modifier la note
                </button>
              )}
              {(isSuperAdmin || (!isAdmin && status === 'Soumise')) && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setOpen(false);
                      onDelete(_id);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    Supprimer la note
                  </button>
                </>
              )}
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
    proof: PropTypes.string,
    userEmail: PropTypes.string,
    userName: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onPhotoPreview: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default InvoiceItem;
