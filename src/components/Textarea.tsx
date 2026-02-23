import * as React from 'react'
import { twMerge } from 'tailwind-merge'

interface TextareaProps extends React.ComponentProps<'textarea'> {}

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={twMerge(
        'h-full w-full outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }