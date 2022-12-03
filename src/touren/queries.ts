import { useQuery } from '@tanstack/react-query'
import type { Acf, TourenType } from './datatype'

const getPages = async () => {
  const url = new URL(
    `${import.meta.env.VITE_URL}/wp-json/wp/v2/pages?parent=12472&per_page=100`
  )

  const req = await fetch(url)

  return (await req.json()) as TourenType[]
}

export const useTouren = () => {
  return useQuery(['Touren'], getPages)
}
