'use client'

import { useEffect, useState } from 'react'

export default function AgentationRuntime() {
  const [AgentationComponent, setAgentationComponent] = useState<null | React.ComponentType<{ endpoint: string }>>(null)

  useEffect(() => {
    let active = true

    async function load() {
      const mod = await import('agentation')
      if (!active) return
      setAgentationComponent(() => mod.Agentation)
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!AgentationComponent) {
    return null
  }

  return <AgentationComponent endpoint="http://localhost:4747" />
}
