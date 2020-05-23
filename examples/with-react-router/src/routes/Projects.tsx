import * as React from 'react'
import { Link } from 'react-router-dom'

const projects = ['a', 'b', 'c']

export function ProjectsPage() {
  return <div>
    <h1>This is Projects Page</h1>
    <ul>
      {projects.map(p => (
        <li key={p}>
          <Link to={`/projects/${p}`}>Project {p}</Link>
        </li>
      ))}
    </ul>
  </div>
}
