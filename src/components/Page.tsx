import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PageProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

const Page: React.FC<PageProps> = ({
  header,
  children,
  className
}) => {
  return ( 
    <div className={twMerge(
      'w-full h-full flex flex-col items-center overflow-y-auto p-2',
      className,
    )}>
      <div className='w-full md:w-xl flex flex-col gap-4'>
        {header && (
          <p className='border-b-4 border-double pb-2'>
            {header}
          </p>
        )}
        {children}
      </div>
    </div>
   );
}
 
export default Page;