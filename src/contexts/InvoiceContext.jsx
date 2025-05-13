import { createContext, useContext, useState, useEffect } from 'react'
import { format } from 'date-fns'

// Create context
const InvoiceContext = createContext()

// Hook to use the invoice context
export const useInvoices = () => {
  return useContext(InvoiceContext)
}

// Provider component
export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load invoices from localStorage
    const storedInvoices = localStorage.getItem('invoices')
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices))
    } else {
      // If no invoices in storage, initialize with sample data
      const sampleInvoices = generateSampleInvoices()
      setInvoices(sampleInvoices)
      localStorage.setItem('invoices', JSON.stringify(sampleInvoices))
    }
    setLoading(false)
  }, [])

  // Generate sample invoices for demo purposes
  const generateSampleInvoices = () => {
    return [
      {
        id: '1',
        clientName: 'Apple Inc.',
        amount: 3200.00,
        date: format(new Date(2023, 3, 15), 'yyyy-MM-dd'),
        status: 'paid',
        dueDate: format(new Date(2023, 4, 15), 'yyyy-MM-dd'),
      },
      {
        id: '2',
        clientName: 'Google LLC',
        amount: 1500.00,
        date: format(new Date(2023, 2, 28), 'yyyy-MM-dd'),
        status: 'pending',
        dueDate: format(new Date(2023, 3, 28), 'yyyy-MM-dd'),
      },
      {
        id: '3',
        clientName: 'Meta Platforms',
        amount: 850.00,
        date: format(new Date(2023, 3, 5), 'yyyy-MM-dd'),
        status: 'overdue',
        dueDate: format(new Date(2023, 4, 5), 'yyyy-MM-dd'),
      },
      {
        id: '4',
        clientName: 'Microsoft Corporation',
        amount: 4750.00,
        date: format(new Date(2023, 2, 15), 'yyyy-MM-dd'),
        status: 'paid',
        dueDate: format(new Date(2023, 3, 15), 'yyyy-MM-dd'),
      },
      {
        id: '5',
        clientName: 'Amazon Web Services',
        amount: 2340.00,
        date: format(new Date(2023, 3, 1), 'yyyy-MM-dd'),
        status: 'pending',
        dueDate: format(new Date(2023, 4, 1), 'yyyy-MM-dd'),
      },
    ]
  }

  // Add new invoice
  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Math.random().toString(36).substring(2, 9), // Generate a simple ID
      date: format(new Date(), 'yyyy-MM-dd'), // Current date
    }
    
    const updatedInvoices = [...invoices, newInvoice]
    setInvoices(updatedInvoices)
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices))
    return newInvoice
  }

  // Delete invoice
  const deleteInvoice = (id) => {
    const updatedInvoices = invoices.filter(invoice => invoice.id !== id)
    setInvoices(updatedInvoices)
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices))
  }

  // Update invoice
  const updateInvoice = (id, updatedData) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === id ? { ...invoice, ...updatedData } : invoice
    )
    setInvoices(updatedInvoices)
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices))
  }

  const value = {
    invoices,
    addInvoice,
    deleteInvoice,
    updateInvoice,
    loading,
  }

  return (
    <InvoiceContext.Provider value={value}>
      {!loading && children}
    </InvoiceContext.Provider>
  )
}