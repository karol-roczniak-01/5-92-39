import * as React from 'react'
import { twMerge } from 'tailwind-merge'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={twMerge('w-full outline-none', className)}
      {...props}
    />
  )
}

export { Input }