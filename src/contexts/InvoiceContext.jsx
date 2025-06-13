import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

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
  const { token } = useAuth()

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!token) {
        setLoading(false) // Prevent infinite loading if no token
        return
      }

      try {
        const response = await fetch('https://gsb-backend-nti4.onrender.com/bills', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch invoices')
        }

        const data = await response.json()
        console.log("Fetched invoices:", data)

        // Adjust according to backend response structure:
        setInvoices(data.bills || data) // if backend returns { bills: [...] } or directly an array
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [token])

  // Add new invoice
  const addInvoice = async (invoiceData) => {
    try {
      const formData = new FormData()
      formData.append('proof', invoiceData.proof)
      formData.append('metadata', JSON.stringify({
        date: invoiceData.date,
        amount: invoiceData.amount,
        description: invoiceData.description,
        status: invoiceData.status,
        type: invoiceData.type
      }))

      const response = await fetch('https://gsb-backend-nti4.onrender.com/bills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const newInvoice = await response.json()
      setInvoices(prev => [...prev, newInvoice])
      return newInvoice
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  // Update invoice
  const updateInvoice = async (id, updatedData) => {
    try {
      const response = await fetch(`https://gsb-backend-nti4.onrender.com/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        throw new Error('Failed to update invoice')
      }

      const updatedInvoice = await response.json()
      setInvoices(prev => prev.map(invoice =>
        invoice._id === id ? updatedInvoice : invoice
      ))
      return updatedInvoice
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  }

  // Delete invoice
  const deleteInvoice = async (id) => {
    try {
      const response = await fetch(`https://gsb-backend-nti4.onrender.com/bills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      setInvoices(prev => prev.filter(invoice => invoice._id !== id))
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
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
