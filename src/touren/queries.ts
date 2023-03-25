import { QueryFunction, useQueries, useQuery } from '@tanstack/react-query'
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
const selectedSizes: Array<keyof MediaType['media_details']['sizes']> = [
  'medium_large',
  'large',
  'full'
]

const getImage: QueryFunction<
  {
    srcSet: string
    src: string
  } | null,
  [string, number]
> = async ({ queryKey }) => {
  const [_, imageId] = queryKey
  const url = `${import.meta.env.VITE_URL}/wp-json/wp/v2/media/${imageId}`

  const req = await fetch(url).catch((e) => ({ error: e }))

  if ('error' in req) {
    return null
  }
  const image = (await req.json()) as MediaType

  const srcSet = selectedSizes
    .map((key) => {
      const src = image?.media_details.sizes[key]

      if (!src) return ''

      return `${src.source_url} ${src.width}w`
    })
    .join(', ')
  const src = image?.media_details.sizes.medium_large.source_url

  return { srcSet, src }
}

export const useImages = (imageIds: number[], inView: boolean) => {
  return useQueries({
    queries: imageIds.map((x) => ({
      queryKey: ['media', x] as [string, number],
      queryFn: getImage,
      enabled: inView && !!x && x !== 0
    }))
  })
}

export const useImage = (imageId?: number) => {
  return useQuery(['media', imageId] as [string, number], getImage, {
    enabled: !!imageId && imageId !== 0
  })
}
