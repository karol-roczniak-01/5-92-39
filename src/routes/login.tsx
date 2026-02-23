import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useAuth } from './-auth'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import Loader from '@/components/Loader'
import useMobile from '@/hooks/useMobile'
import Page from '@/components/Page'

export const Route = createFileRoute('/login')({
  pendingComponent: () => <Loader />,
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { login } = useAuth()
  const isMobile = useMobile()
  const [apiError, setApiError] = useState<string>('')

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setApiError('')
        await login(value.email, value.password)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Login failed')
      }
    },
  })

  return (
    <Page header="Log in to your 19-18-8-103 account">
      {apiError && (
        <p>{apiError}</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className='flex flex-col gap-2'
      >
        {/* Email */}
        <form.Field
          name="email"
          validators={{
          onSubmit: ({ value }) => {
              if (!value) return 'Email is required'
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Invalid email format'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col">
              <div className='flex gap-2 items-center'>
                <label>
                  [Email]
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="email@example.com"
                  autoFocus={!isMobile}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className='opacity-70'>
                  ! {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Password */}
        <form.Field
          name="password"
          validators={{
            onSubmit: ({ value }) => {
              if (!value) return 'Password is required'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col">
              <div className='flex gap-2 items-center'>
                <label>
                  [Password]
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className='opacity-70'>
                  ! {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className='flex pt-2'>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Page>
  )
}
