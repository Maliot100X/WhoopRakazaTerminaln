import { createFileRoute } from '@tanstack/react-router'
import { Explorer } from '../../components/Explorer'

export const Route = createFileRoute('/experiences/$experienceId')({
  head: () => ({ meta: [{ title: 'Rakaza AI Terminal' }] }),
  component: Explorer,
})
