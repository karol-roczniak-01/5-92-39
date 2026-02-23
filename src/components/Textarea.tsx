import * as React from 'react'
import { twMerge } from 'tailwind-merge'

interface TextareaProps extends React.ComponentProps<'textarea'> {}

function Textarea({ className, onChange, ...props }: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize()
    onChange?.(e)
  }

  React.useEffect(() => {
    resize()
  }, [props.value])

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={twMerge(
        'h-full w-full outline-none overflow-hidden resize-none',
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Textarea }