import React, { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import InvoiceItem from './InvoiceItem';
import Button from '../common/Button';

function InvoiceList({ invoices = [], onCreateNew, onView, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      onDelete(id);
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      // Filter by status
      if (filter !== 'all' && invoice.status !== filter) return false;

      // Filter by search (client name or invoice ID)
      const query = search.toLowerCase();
      const nameMatch = invoice.clientName?.toLowerCase().includes(query);
      const idMatch = invoice._id?.toLowerCase().includes(query);
      return !search || nameMatch || idMatch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by due date (newest first)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Recherche par client ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="all">Tous les status</option>
                <option value="payé">payé</option>
                <option value="en cours">en cours</option>
                <option value="en attente">en attente</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <Button onClick={onCreateNew}>New Invoice</Button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(invoice => (
            <InvoiceItem
              key={invoice._id}
              invoice={invoice}
              onDelete={handleDelete}
              onView={onView}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            {search || filter !== 'all' ? (
              <>
                <p className="text-lg">No matching invoices found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </>
            ) : (
              <>
                <p className="text-lg">No invoices yet</p>
                <p className="text-sm">Create your first invoice to get started</p>
                <Button onClick={onCreateNew} className="mt-4">
                  Create New Invoice
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;
