import { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from './Button'

interface PaymentFormProps {
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function PaymentForm({ clientSecret, onSuccess, onError, disabled }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <label className="shrink-0">[card]</label>
        <div className="flex-1">
          <CardElement
            onChange={(e) => setCardComplete(e.complete)}
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#FF8C00',
                  fontFamily: '"Inconsolata", monospace',
                  fontSmoothing: 'antialiased',
                  iconColor: '#FF8C00',
                  '::placeholder': {
                    color: 'rgba(255, 140, 0, 0.7)',
                  },
                  ':-webkit-autofill': {
                    color: '#FF8C00',
                  },
                },
                invalid: {
                  color: 'rgba(255, 140, 0, 0.5)',
                  iconColor: 'rgba(255, 140, 0, 0.5)',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || disabled || !cardComplete}
        className="px-2"
      >
        {isProcessing ? '[processing...]' : '[pay $149.00]'}
      </Button>
    </form>
  )
}