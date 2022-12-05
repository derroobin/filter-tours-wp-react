import { useImage } from './queries'
import { useInView } from 'react-intersection-observer'
import type { MediaType } from './datatype'
import { Placeholder } from './placeholder'

interface ImageProps {
  imageId: number
  idx: number
}
const Image = ({ imageId, idx }: ImageProps) => {
  const image = useImage(imageId)
  const { ref, inView } = useInView({
    initialInView: idx < 1,
    triggerOnce: true
  })

  const selectedSizes: Array<keyof MediaType['media_details']['sizes']> = [
    'medium_large',
    'large',
    'full'
  ]
  const srcSet = selectedSizes
    .map((key) => {
      const src = image.data?.media_details.sizes[key]

      if (!src) return ''

      return `${src.source_url} ${src.width}w`
    })
    .join(', ')

  return (
    <div
      className="relative col-start-1 row-start-1 z-0 overflow-hidden"
      ref={ref}>
      <Placeholder />
      {image.data && inView ? (
        <img
          loading={idx <= 1 ? 'eager' : 'lazy'}
          className="absolute inset-0 z-0 object-cover w-full h-full"
          src={image.data.media_details.sizes.medium_large.source_url}
          sizes="100vw"
          srcSet={srcSet}
          alt={image.data.title.rendered}
        />
      ) : null}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(160deg,rgb(28,40,65),rgb(0,14,41))] opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  )
}

export default Image
