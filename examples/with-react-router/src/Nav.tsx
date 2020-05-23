import * as React from 'react'
import { Link } from 'react-router-dom'

export function Nav() {
  return (
    <nav>
      <Link style={{ padding: 2 }} to="/">Home</Link>
      <Link style={{ padding: 2 }} to="projects">Projects</Link>
    </nav>
  )
}
