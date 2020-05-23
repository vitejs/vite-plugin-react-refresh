import * as React from 'react'

import { Nav } from './Nav'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      {children}
    </div>
  )
}
