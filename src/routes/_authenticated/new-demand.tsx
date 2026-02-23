import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { useCreateDemand } from '@/hooks/useDemand'
import Page from '@/components/Page'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/new-demand')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const { mutate: createDemand, isPending } = useCreateDemand()
  const [apiError, setApiError] = useState<string>('')

  const form = useForm({
    defaultValues: {
      content: '',
      email: '',
      phone: '',
      days: '30',
    },
    onSubmit: async ({ value }) => {
      const daysNum = parseInt(value.days) || 0
      setApiError('')
      createDemand(
        {
          content: value.content.trim(),
          email: value.email.trim(),
          phone: value.phone.trim() || undefined,
          userId: auth.user!.id,
          days: daysNum,
        },
        {
          onSuccess: () => navigate({ to: '/my-demands' }),
          onError: (err) =>
            setApiError(err instanceof Error ? err.message : 'Failed to create demand'),
        },
      )
    },
  })

  return (
    <Page header="New Demand">
      {apiError && <p>{apiError}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-2"
      >
        {/* Content */}
        <form.Field
          name="content"
          validators={{
            onSubmit: ({ value }) => {
              const trimmed = value.trim()
              if (!trimmed) return 'Description is required'
              if (trimmed.length < 50) return 'Minimum 50 characters'
              if (trimmed.length > 1000) return 'Maximum 1000 characters'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col">
              <div className="flex gap-2 items-start">
                <div className='flex flex-col'>
                  <label>[Description]</label>
                  <span className='opacity-70'>{field.state.value.trim().length}/1000</span>
                  <span className='opacity-70'>min 50</span>
                </div>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Outpatient imaging center seeking refurbished or new 1.5T MRI system..."
                  rows={5}
                  className="resize-none"
                  disabled={isPending}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="opacity-70">! {field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onSubmit: ({ value }) => {
              if (!value.trim()) return 'Email is required'
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <label>[Email]</label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isPending}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="opacity-70">! {field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Phone */}
        <form.Field name="phone">
          {(field) => (
            <div className="flex gap-2 items-center">
              <label>[Phone]</label>
              <Input
                id={field.name}
                name={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+48 123 456 789 (optional)"
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

        {/* Days */}
        <form.Field
          name="days"
          validators={{
            onSubmit: ({ value }) => {
              const n = parseInt(value) || 0
              if (n < 1 || n > 180) return 'Enter between 1 and 180 days'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col">
              <div className="flex gap-2 items-start">
                <div className='flex flex-col'>
                  <label>[Duration]</label>
                  <span className='opacity-70'>max 180</span>
                </div>
                <div className='flex items-center'>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Duration in days"
                    min="1"
                    max="180"
                    className='w-11'
                    disabled={isPending}
                  />
                  <p>days</p>
                </div>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="opacity-70">! {field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <div className="flex pt-2">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting || isPending} className="w-full">
                {isSubmitting || isPending ? 'Creating...' : 'Create'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Page>
  )
}