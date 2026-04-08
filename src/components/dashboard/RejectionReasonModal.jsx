import React, { useState } from 'react'
import { FiX, FiAlertCircle } from 'react-icons/fi'

function RejectionReasonModal({ isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Veuillez indiquer une raison de refus')
      return
    }
    if (reason.length > 200) {
      setError('200 caractères maximum')
      return
    }
    onConfirm(reason.trim())
    setReason('')
    setError('')
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Refuser la note</h3>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Veuillez indiquer la raison du refus. Cette information sera visible par l'auteur de la note.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <textarea
              value={reason}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setReason(e.target.value)
                  if (error) setError('')
                }
              }}
              placeholder="Ex: Justificatif illisible, montant incorrect..."
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-right mt-1">{reason.length}/200</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Refus en cours...' : 'Confirmer le refus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RejectionReasonModal
