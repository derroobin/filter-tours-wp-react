import { useImages, useImage } from './queries'
import { useInView } from 'react-intersection-observer'
import type { MediaType } from './datatype'
import { Placeholder } from './placeholder'

interface ImageProps {
  imageIds: number[]
  idx: number
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wrap } from 'popmotion'
import { useQuery } from '@tanstack/react-query'

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: 0,
      opacity: 0.5
    }
  }
}

interface ButtonProps {
  prev?: boolean
  onClick: () => void
}
const Button = ({ prev, onClick }: ButtonProps) => {
  return (
    <button
      aria-label={prev ? 'Voheriges Bild' : 'Nächstes Bild'}
      className={`top-1/2 absolute -translate-y-1/2 z-20 
      bg-white rounded-full font-bold text-lg
      w-10 h-10
      flex justify-center items-center select-none ${
        prev ? 'left-2 -scale-x-100' : 'right-2'
      }`}
      onClick={onClick}>
      {'‣'}
    </button>
  )
}
/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

interface ImagesProps {
  images: Array<{ src: string; srcSet: string }>
}
const Images = ({ images }: ImagesProps) => {
  const [[page, direction], setPage] = useState([0, 0])

  // We only have 3 images, but we paginate them absolutely (ie 1, 2, 3, 4, 5...) and
  // then wrap that within 0-2 to find our image ID in the array below. By passing an
  // absolute page index as the `motion` component's `key` prop, `AnimatePresence` will
  // detect it as an entirely new image. So you can infinitely paginate as few as 1 images.
  const imageIndex = wrap(0, images.length, page)
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  return (
    <>
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          className="absolute inset-0 z-0 object-cover w-full h-full"
          src={images[imageIndex].src}
          srcSet={images[imageIndex].srcSet}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
        />
      </AnimatePresence>
      {images.length > 0 ? (
        <>
          <Button onClick={() => paginate(-1)} prev />
          <Button onClick={() => paginate(1)} />
        </>
      ) : null}
    </>
  )
}

const Image = ({ imageIds, idx }: ImageProps) => {
  const { ref, inView } = useInView({
    initialInView: idx < 1,
    triggerOnce: true
  })
  const [first, ...others] = imageIds
  const { data: image } = useImage(first)
  const images = useImages(others, inView)

  const allImages = [image, ...images.map((x) => x.data)].filter(Boolean)

  return (
    <div
      className="relative col-start-1 row-start-1 z-0 overflow-hidden"
      ref={ref}>
      <Placeholder />
      {allImages.length > 0 && inView ? <Images images={allImages} /> : null}
    </div>
  )
}

export default Image
