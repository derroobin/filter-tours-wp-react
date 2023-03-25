import { useQuery } from '@tanstack/react-query'
import type { Acf, MediaType, TourenType } from './datatype'

const getPages = async () => {
  const url = new URL(
    `${
      import.meta.env.VITE_URL
    }/wp-json/wp/v2/pages?parent=12472&per_page=100&_fields=acf,slug,title,featured_media,link`
  )
  const req = await fetch(url)

  return (await req.json()) as TourenType[]
}

export const useTouren = () => {
  return useQuery(['Touren'], getPages)
}

const getImage = async (imageId: number) => {
  const url = `${import.meta.env.VITE_URL}/wp-json/wp/v2/media/${imageId}`

  const req = await fetch(url)

  return (await req.json()) as MediaType
}

export const useImage = (imageId: number) => {
  return useQuery(['media', imageId], () => getImage(imageId), {
    enabled: imageId !== 0 && !!imageId
  })
}
