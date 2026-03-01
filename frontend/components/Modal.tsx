'use client'

import { FormEvent, Fragment, useState } from 'react'
import Image from 'next/image'
import { subscribeToProduct } from '@/lib/api'

interface Props {
  productId: number
  isOpen: boolean
  onClose: () => void
}

const Modal = ({ productId, isOpen, onClose }: Props) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) return

    try {
      setIsSubmitting(true)
      await subscribeToProduct(productId, email)
      alert('You will be notified when the price drops!')
      setEmail('')
      onClose()
    } catch (error) {
      console.error(error)
      alert('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="dialog-container" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between">
            <div className="flex-1">
              <Image
                src="/assets/icons/logo.svg"
                alt="logo"
                width={28}
                height={28}
              />

              <h4 className="dialog-head_text">
                Stay updated with product pricing alerts right in your inbox!
              </h4>

              <p className="text-sm text-gray-600 mt-2">
                Never miss a bargain again with our timely alerts!
              </p>
            </div>

            <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>

          <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
            <div className="dialog-input_container">
              <Image
                src="/assets/icons/mail.svg"
                alt="mail"
                width={18}
                height={18}
              />
              <input
                required
                type="email"
                placeholder="Enter your email address"
                className="dialog-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="dialog-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Subscribing...' : 'Track'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Modal