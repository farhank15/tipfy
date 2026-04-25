import { QueryClient } from '@tanstack/react-query'

let clientQueryClient: QueryClient | undefined

export function getContext() {
  if (typeof window === 'undefined') {
    return {
      queryClient: new QueryClient(),
    }
  }

  if (!clientQueryClient) {
    clientQueryClient = new QueryClient()
  }

  return {
    queryClient: clientQueryClient,
  }
}

export default function TanstackQueryProvider() {}
