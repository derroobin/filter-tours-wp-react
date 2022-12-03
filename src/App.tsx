import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Touren from './touren'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Touren />
    </QueryClientProvider>
  )
}
