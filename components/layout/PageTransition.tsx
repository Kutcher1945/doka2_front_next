'use client'

import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-animate {
          animation: pageFadeIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
      <div key={pathname} className="page-animate">
        {children}
      </div>
    </>
  )
}
