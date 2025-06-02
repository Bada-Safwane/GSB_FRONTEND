import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function DropdownMenuPortal({ children, triggerRef, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)

  // Position the menu based on the trigger
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 192 + window.scrollX, // width = 48 * 4
      })
    }
  }, [triggerRef])

  // Close on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, triggerRef])

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="w-48 bg-white rounded-lg shadow-lg border border-gray-100"
    >
      {children}
    </div>,
    document.body
  )
}

export default DropdownMenuPortal
