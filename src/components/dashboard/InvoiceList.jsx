import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheck, FiClock, FiX, FiTrash2, FiChevronUp, FiChevronDown, FiDollarSign } from 'react-icons/fi';
import PropTypes from 'prop-types';
import InvoiceItem from './InvoiceItem';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

function InvoiceList({ invoices = [], onCreateNew, onView, onEdit, onDelete, onFilterChange, onPhotoPreview, onStatusChange, selectedIds, onSelect, onSelectAll, onBulkStatusChange }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const { user } = useAuth();

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      onDelete(id);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      if (filter !== 'all' && invoice.status !== filter) return false;
      const query = search.toLowerCase();
      const descriptionMatch = invoice.userEmail?.toLowerCase().includes(query);
      const idMatch = invoice._id?.toLowerCase().includes(query);
      const typeMatch = invoice.type?.toLowerCase().includes(query);
      return !search || descriptionMatch || idMatch || typeMatch;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const parseDate = (s) => {
        const p = s?.split('/');
        return p?.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : new Date(s || 0);
      };
      switch (sortField) {
        case 'type':
          return dir * (a.type || '').localeCompare(b.type || '');
        case 'user':
          return dir * (a.userName || a.userEmail || '').localeCompare(b.userName || b.userEmail || '');
        case 'amount':
          return dir * (a.amount - b.amount);
        case 'date':
          return dir * (parseDate(a.date) - parseDate(b.date));
        case 'status':
          return dir * (a.status || '').localeCompare(b.status || '');
        case 'createdAt':
        default:
          return dir * (Number(a.createdAt) - Number(b.createdAt));
      }
    });

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredInvoices);
    }
  }, [filteredInvoices]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every(inv => selectedIds?.includes(inv._id));
  const someSelected = selectedIds?.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isAdmin ? 'Recherche par utilisateur, type ou ID...' : 'Recherche par type ou ID...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-sm transition-all"
            >
                <option value="all">Tous les statuts</option>
                <option value="Soumise">Soumise</option>
                <option value="Validée">Validée</option>
                <option value="Refusée">Refusée</option>
                <option value="Remboursée">Remboursée</option>
              </select>
            <Button onClick={onCreateNew}>+ Nouvelle note</Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (admin only, when items selected) */}
      {isAdmin && someSelected && (
        <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-medium text-primary-700">
            {selectedIds.length} note{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkStatusChange('Validée')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium transition-colors"
            >
              <FiCheck className="w-3.5 h-3.5" />
              Valider
            </button>
            <button
              onClick={() => onBulkStatusChange('Remboursée')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium transition-colors"
            >
              <FiDollarSign className="w-3.5 h-3.5" />
              Rembourser
            </button>
            <button
              onClick={() => onBulkStatusChange('Refusée')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
              Refuser
            </button>
          </div>
        </div>
      )}

      {/* Column Headers */}
      <div className="hidden lg:flex items-center px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider select-none">
        <div className="flex items-center gap-4 flex-1">
          {isAdmin && (
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={() => onSelectAll(filteredInvoices.map(inv => inv._id))}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
            />
          )}
          <span className="w-10"></span>
          <button onClick={() => handleSort('type')} className="flex items-center gap-1 hover:text-gray-700 transition-colors group">
            Note de frais
            {sortField === 'type'
              ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
              : <FiChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
          </button>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0 px-4">
          {isAdmin && (
            <button onClick={() => handleSort('user')} className="flex items-center gap-1 w-40 hover:text-gray-700 transition-colors group">
              Utilisateur
              {sortField === 'user'
                ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
                : <FiChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
            </button>
          )}
          <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 w-28 hover:text-gray-700 transition-colors group">
            Créée le
            {sortField === 'createdAt'
              ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
              : <FiChevronDown className="w-3 h-3 text-primary-500" />}
          </button>
          <button onClick={() => handleSort('date')} className="flex items-center gap-1 w-28 hover:text-gray-700 transition-colors group">
            Facture
            {sortField === 'date'
              ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
              : <FiChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
          </button>
          <button onClick={() => handleSort('status')} className="flex items-center justify-center gap-1 w-28 hover:text-gray-700 transition-colors group">
            Statut
            {sortField === 'status'
              ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
              : <FiChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
          </button>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => handleSort('amount')} className="flex items-center gap-1 w-24 justify-end hover:text-gray-700 transition-colors group">
            Montant
            {sortField === 'amount'
              ? (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-500" /> : <FiChevronDown className="w-3 h-3 text-primary-500" />)
              : <FiChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
          </button>
          {isAdmin && <span className="w-20 text-center">Actions</span>}
          <span className="w-10"></span>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="divide-y divide-gray-50">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(invoice => (
            <InvoiceItem
              key={invoice._id}
              invoice={invoice}
              onDelete={handleDelete}
              onView={onView}
              onEdit={onEdit}
              onPhotoPreview={onPhotoPreview}
              onStatusChange={onStatusChange}
              isSelected={selectedIds?.includes(invoice._id)}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="py-12 text-center text-gray-400">
            {search || filter !== 'all' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiSearch className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-500">Aucune note retrouvée</p>
                <p className="text-sm mt-1">Essayez d'ajuster votre recherche ou vos filtres</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiFilter className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-500">Aucune note pour l'instant</p>
                <p className="text-sm mt-1">Créez votre première note de frais pour démarrer</p>
                <Button onClick={onCreateNew} className="mt-4">
                  Créer une nouvelle note
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {filteredInvoices.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          {filteredInvoices.length} note{filteredInvoices.length > 1 ? 's' : ''} de frais
          {filter !== 'all' && ` • Filtre: ${filter}`}
        </div>
      )}
    </div>
  );
}

InvoiceList.propTypes = {
  invoices: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      description: PropTypes.string,
      type: PropTypes.string,
      proof: PropTypes.string,
      userEmail: PropTypes.string,
    })
  ),
  onCreateNew: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func,
  onPhotoPreview: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
  onBulkStatusChange: PropTypes.func,
};

export default InvoiceList;
