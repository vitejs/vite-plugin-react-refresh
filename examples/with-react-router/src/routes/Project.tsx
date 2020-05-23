import * as React from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

export function ProjectPage() {
  const { id } = useParams()
  return <div>
    <h1>This is Project {id} page</h1>
    <Link to="/projects">Back</Link>
  </div>
}
