import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { useAuth } from '../../contexts/AuthContext'

const EXPENSE_TYPES = [
  'Transport',
  'Hébergement',
  'Restauration',
  'Fournitures',
  'Téléphone',
  'Déplacement',
  'Formation',
  'Représentation',
  'Autre',
]

function NewInvoiceModal({ isOpen, onClose, editInvoice = null, onInvoiceSaved }) {
  const { token, user } = useAuth()
  const [formData, setFormData] = useState({
    date: format(new Date(), 'dd/MM/yyyy'),
    amount: '',
    description: '',
    status: 'Soumise',
    type: 'Transport',
    customType: '',
    proof: null
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)  // track if form changed

  useEffect(() => {
    if (editInvoice) {
      const isKnownType = EXPENSE_TYPES.includes(editInvoice.type)
      setFormData({
        date: editInvoice.date || format(new Date(), 'dd/MM/yyyy'),
        amount: editInvoice.amount?.toString() || '',
        description: editInvoice.description || '',
        status: editInvoice.status || 'Soumise',
        type: isKnownType ? editInvoice.type : 'Autre',
        customType: isKnownType ? '' : (editInvoice.type || ''),
        proof: null
      })
    } else {
      setFormData({
        date: format(new Date(), 'dd/MM/yyyy'),
        amount: '',
        description: '',
        status: 'Soumise',
        type: 'Transport',
        customType: '',
        proof: null
      })
    }
    setErrors({})
    setIsDirty(false)  // reset dirty on open/reset
  }, [editInvoice, isOpen])

  const handleChange = (e) => {
    const { id, value, files } = e.target
    setIsDirty(true) // mark form as changed

    if (id === 'proof' && files) {
      setFormData(prev => ({
        ...prev,
        proof: files[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value,
      }))
    }

    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount.trim()) {
      newErrors.amount = 'Le montant est requis'
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (formData.type === 'Autre' && !formData.customType.trim()) {
      newErrors.customType = 'Veuillez préciser le type'
    }

    if (formData.type === 'Autre' && formData.customType.length > 30) {
      newErrors.customType = '30 caractères maximum'
    }

    if (!editInvoice && !formData.proof) {
      newErrors.proof = 'Le justificatif est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const resolvedType = formData.type === 'Autre' ? formData.customType.trim() : formData.type

    try {
      if (editInvoice) {
        let proofUrl = editInvoice.proof

        if (formData.proof instanceof File) {
          const uploadForm = new FormData()
          uploadForm.append('proof', formData.proof)

          const uploadResponse = await fetch('https://gsb-backend-nti4.onrender.com/upload', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: uploadForm
          })

          if (!uploadResponse.ok) throw new Error('File upload failed')

          const uploadResult = await uploadResponse.json()
          proofUrl = uploadResult.url
        }

        const response = await fetch(`https://gsb-backend-nti4.onrender.com/bills/${editInvoice._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            date: formData.date,
            amount: parseFloat(formData.amount),
            proof: proofUrl,
            description: formData.description,
            user: editInvoice.user,
            status: formData.status,
            type: resolvedType,
            createdAt: editInvoice.createdAt
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update invoice')
        }

        if (onInvoiceSaved) onInvoiceSaved()
        setIsDirty(false)
        onClose()
      } else {
        const formDataToSend = new FormData()
        formDataToSend.append('proof', formData.proof)
        formDataToSend.append('metadata', JSON.stringify({
          date: formData.date,
          amount: parseFloat(formData.amount),
          description: formData.description,
          status: formData.status,
          type: resolvedType
        }))

        const response = await fetch('https://gsb-backend-nti4.onrender.com/bills', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formDataToSend
        })

        if (!response.ok) {
          throw new Error('Failed to create invoice')
        }

        if (onInvoiceSaved) onInvoiceSaved()
        setIsDirty(false)
        onClose()
      }
    } catch (error) {
      console.error('Error submitting invoice:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit invoice. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm before closing if form is dirty
  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      )
      if (!confirmClose) {
        return
      }
    }
    onClose()
    setIsDirty(false)
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
        Annuler
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {editInvoice ? 'Modifier' : 'Créer la note'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editInvoice ? 'Modifier la note' : 'Nouvelle note de frais'}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            id="date"
            value={(() => {
              const [day, month, year] = formData.date.split('/');
              return `${year}-${month}-${day}`;
            })()}
            onChange={(e) => {
              const newDate = e.target.value;
              const [year, month, day] = newDate.split('-');
              const formattedDate = `${day}/${month}/${year}`;

              setFormData(prev => ({
                ...prev,
                date: formattedDate
              }));
              setIsDirty(true)
              if (errors.date) {
                setErrors(prev => ({
                  ...prev,
                  date: ''
                }));
              }
            }}
            error={errors.date}
            required
          />

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
        </div>

        {(user?.role === 'admin' || user?.role === 'superadmin') ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => {
                handleChange(e)
                setIsDirty(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="Soumise">Soumise</option>
              <option value="Validée">Validée</option>
              <option value="Refusée">Refusée</option>
              <option value="Remboursée">Remboursée</option>
            </select>
          </div>
        ) : (
          <input type="hidden" id="status" value={formData.status} readOnly />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de dépense</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => {
              handleChange(e)
              if (e.target.value !== 'Autre') {
                setFormData(prev => ({ ...prev, customType: '' }))
              }
              setIsDirty(true)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            {EXPENSE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {formData.type === 'Autre' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veuillez préciser</label>
            <input
              id="customType"
              type="text"
              value={formData.customType}
              onChange={(e) => {
                const val = e.target.value
                if (val.length <= 30) {
                  setFormData(prev => ({ ...prev, customType: val }))
                  setIsDirty(true)
                  if (errors.customType) {
                    setErrors(prev => ({ ...prev, customType: '' }))
                  }
                }
              }}
              maxLength={30}
              placeholder="Ex: Péage, Parking..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <div className="flex justify-between mt-1">
              {errors.customType && <p className="text-sm text-red-600">{errors.customType}</p>}
              <p className="text-xs text-gray-400 ml-auto">{formData.customType.length}/30</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preuve de facture</label>
            <input
              id="proof"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleChange(e)
                setIsDirty(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          {errors.proof && <p className="mt-1 text-sm text-red-600">{errors.proof}</p>}
          {editInvoice?.proof && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preuve actuelle:</p>
              <img
                src={editInvoice.proof}
                alt="Preuve actuelle"
                className="rounded-md max-h-48 object-contain border border-gray-200"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            placeholder="Entrer description"
            value={formData.description}
            onChange={(e) => {
              handleChange(e)
              setIsDirty(true)
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </Modal>
  )
}

export default NewInvoiceModal
