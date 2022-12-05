import { Dispatch, useEffect, useState, SetStateAction, useRef } from 'react'
import { useImage, useTouren } from './queries'
import type { TourenType, Acf, MediaType } from './datatype'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect
} from 'react-roving-tabindex'

type ParameterType = Record<keyof Acf, string | null>
type FilterOuterProps = ParameterType &
  Record<
    `set${Capitalize<keyof Acf>}`,
    Dispatch<SetStateAction<string | null>>
  > & { options: FilterProps }

type FilterProps = Record<`${keyof Acf}s`, Array<string>>

interface SelectionType {
  options: string[]
  value: string | null
  setState: Dispatch<SetStateAction<string | null>>
  name: string
}

const Option = ({
  setState,
  name,
  value,
  option,
  idx,
  disabled = false
}: Omit<SelectionType, 'options'> & {
  option: null | string
  idx: number
  disabled?: boolean
}) => {
  const id = (name + idx).replace(/[äüö]/, '').toLowerCase()
  const ref = useRef<HTMLButtonElement>(null)
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled
  )
  useFocusEffect(focused, ref)

  return (
    <li className="list-none">
      <span
        className="cursor-pointer block focus:bg-blue-400 hover:bg-blue-400 w-full text-left px-4 py-2 rounded-md"
        ref={ref}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          handleClick()
          setState(option || null)
          ref.current?.blur()
        }}>
        {option || 'abwählen'}
      </span>
    </li>
  )
}
//
const Selection = ({ setState, name, value, options }: SelectionType) => {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (ref.current) {
      const x = () => {
        setExpanded(true)
      }
      const y = () => {
        setExpanded(false)
      }
      ref.current.addEventListener('focusin', x)
      ref.current.addEventListener('focusout', y)

      return () => {
        ref.current?.removeEventListener('focusin', x)
        ref.current?.removeEventListener('focusout', y)
      }
    }
  }, [])
  return (
    <div className="relative" aria-label={name}>
      <div className="group relative" ref={ref}>
        <span
          className="block capitalize border rounded-md border-gray-400 px-4 py-2 w-full text-left text-lg bg-white cursor-pointer"
          tabIndex={-1}
          onClick={() => ref.current?.focus()}>
          {value || name}
        </span>

        <ul
          className="opacity-0 -translate-y-2 top-[110%] pointer-events-none group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto position: absolute inset-x-0 bg-white rounded-md z-10 list-none drop-shadow-md grid gap-2 transition-all"
          aria-haspopup="true"
          aria-expanded={expanded}>
          <RovingTabIndexProvider>
            {options.map((x, idx) => (
              <Option
                idx={idx}
                option={x}
                setState={setState}
                key={x}
                value={value}
                name={name}
              />
            ))}
          </RovingTabIndexProvider>
        </ul>
      </div>
      {!!value ? (
        <button
          onClick={() => setState(null)}
          className="absolute right-1  aspect-square h-9 top-1/2 -translate-y-1/2 hover:bg-gray-400 rounded-full"
          aria-label="Auswahl leeren">
          x
        </button>
      ) : null}
    </div>
  )
}

const Filter = ({
  dauer,
  setDauer,
  setGipfelhoehe,
  gipfelhoehe,
  hoehenmeter,
  setHoehenmeter,
  land,
  setLand,
  region,
  setRegion,
  schwierigkeit,
  setSchwierigkeit,
  options: {
    lands,
    regions,
    schwierigkeits,
    gipfelhoehes,
    hoehenmeters,
    dauers
  }
}: FilterOuterProps) => {
  return (
    <div className="grid lg:grid-cols-2 max-w-md lg:max-w-lg gap-x-3 gap-y-2 mx-auto pt-2 mb-10 px-4">
      <Selection
        name="dauer"
        options={dauers}
        setState={setDauer}
        value={dauer}
      />
      <Selection
        name="schwierigkeit"
        options={schwierigkeits}
        setState={setSchwierigkeit}
        value={schwierigkeit}
      />
      <Selection name="land" options={lands} setState={setLand} value={land} />
      <Selection
        name="region"
        options={regions}
        setState={setRegion}
        value={region}
      />
      <Selection
        name="gipfelhöhe"
        options={gipfelhoehes}
        setState={setGipfelhoehe}
        value={gipfelhoehe}
      />
      <Selection
        name="höhenmeter"
        options={hoehenmeters}
        setState={setHoehenmeter}
        value={hoehenmeter}
      />
    </div>
  )
}
const useSetting = (
  url: URL,
  id: keyof Acf
): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const [state, setState] = useState<string | null>(
    url.searchParams.get(id) || ''
  )

  useEffect(() => {
    const x = url.searchParams.get(id)
    if (x !== state) setState(x)
  }, [url])

  return [state, setState]
}

const useURL = () => {
  const [url, setUrl] = useState(new URL(window.location.href))

  useEffect(() => {
    const update = () => {
      setUrl(new URL(window.location.href))
    }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return url
}

const useFilter = () => {
  const url = useURL()
  const [dauer, setDauer] = useSetting(url, 'dauer')
  const [hoehenmeter, setHoehenmeter] = useSetting(url, 'hoehenmeter')
  const [land, setLand] = useSetting(url, 'land')
  const [gipfelhoehe, setGipfelhoehe] = useSetting(url, 'gipfelhoehe')
  const [schwierigkeit, setSchwierigkeit] = useSetting(url, 'schwierigkeit')
  const [region, setRegion] = useSetting(url, 'region')

  const all = useTouren()
  const options = useOptions()

  const [filtered, setFiltered] = useState<TourenType[]>([])

  // filters data
  useEffect(() => {
    if (all.data) {
      setFiltered(
        all.data.filter(({ acf }) => {
          if (land && land !== acf.land) {
            return false
          }

          if (gipfelhoehe && gipfelhoehe !== acf.gipfelhoehe) {
            return false
          }

          if (region && region !== acf.region) {
            return false
          }

          if (hoehenmeter && hoehenmeter !== acf.hoehenmeter) {
            return false
          }

          if (schwierigkeit && schwierigkeit !== acf.schwierigkeit) {
            return false
          }
          if (dauer && dauer !== acf.dauer) {
            return false
          }

          return true
        })
      )
    }
  }, [all.data, land, gipfelhoehe, region, schwierigkeit, hoehenmeter, dauer])

  // handles setting of options to url
  useEffect(() => {
    const parameter: ParameterType = {
      dauer,
      hoehenmeter,
      land,
      gipfelhoehe,
      schwierigkeit,
      region
    }

    const url = new URL(window.location.href)
    Object.entries(parameter).forEach(([k, v]) => {
      if (v !== url.searchParams.get(k)) {
        if (v) {
          url.searchParams.set(k, v)
        } else {
          url.searchParams.delete(k)
        }
      }
    })

    history.replaceState({}, '', url)
  }, [dauer, hoehenmeter, land, gipfelhoehe, schwierigkeit, region])

  return {
    data: filtered,
    Filter: Filter({
      dauer,
      setDauer,
      hoehenmeter,
      setHoehenmeter,
      land,
      setLand,
      gipfelhoehe,
      setGipfelhoehe,
      schwierigkeit,
      setSchwierigkeit,
      region,
      setRegion,
      options
    })
  }
}

// generates options for filters from api data
const useOptions = () => {
  const data = useTouren()
  const [options, setOptions] = useState<FilterProps>({
    lands: [],
    schwierigkeits: [],
    hoehenmeters: [],
    regions: [],
    gipfelhoehes: [],
    dauers: []
  })
  useEffect(() => {
    if (data.data) {
      const land = new Set<string>()
      const schwierigkeit = new Set<string>()
      const region = new Set<string>()
      const dauer = new Set<string>()
      const gipfelhoehe = new Set<string>()
      const hoehenmeter = new Set<string>()

      for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].acf.region) {
          region.add(data.data[i].acf.region as string)
        }
        if (data.data[i].acf.schwierigkeit) {
          schwierigkeit.add(data.data[i].acf.schwierigkeit as string)
        }
        if (data.data[i].acf.land) {
          land.add(data.data[i].acf.land as string)
        }
        if (data.data[i].acf.gipfelhoehe) {
          gipfelhoehe.add(data.data[i].acf.gipfelhoehe as string)
        }
        if (data.data[i].acf.hoehenmeter) {
          hoehenmeter.add(data.data[i].acf.hoehenmeter as string)
        }
        if (data.data[i].acf.dauer) {
          dauer.add(data.data[i].acf.dauer as string)
        }
      }

      setOptions({
        dauers: Array.from(dauer),
        lands: Array.from(land),
        hoehenmeters: Array.from(hoehenmeter),
        gipfelhoehes: Array.from(gipfelhoehe),
        regions: Array.from(region),
        schwierigkeits: Array.from(schwierigkeit)
      })
    }
  }, [data.data])

  return options
}

const Touren = () => {
  const all = useTouren()
  const { data, Filter } = useFilter()

  console.log('rendering')

  if (all.isLoading || all.isError || !data) return <div>loading..</div>

  return (
    <div>
      {Filter}
      <div className="grid gap-4">
        <AnimatePresence>
          {data.map((x) => (
            <Tour key={x.slug} data={x} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ImageProps {
  imageId: number
}
const Image = ({ imageId }: ImageProps) => {
  const image = useImage(imageId)

  if (imageId === 0 || !image.data) return null

  const selectedSizes: Array<keyof MediaType['media_details']['sizes']> = [
    'medium_large',
    'large',
    'full'
  ]
  const srcSet = selectedSizes
    .map((key) => {
      const src = image.data.media_details.sizes[key]

      if (!src) return ''

      return `${src.source_url} ${src.width}w`
    })
    .join(', ')

  return (
    <div className="relative col-start-1 row-start-1 z-0 overflow-hidden">
      <span
        className="block"
        style={{
          aspectRatio: `8 / 2`
        }}></span>
      <img
        loading="lazy"
        className="absolute inset-0 z-0 object-cover w-full h-full"
        src={image.data.media_details.sizes.medium_large.source_url}
        sizes="100vw"
        srcSet={srcSet}
      />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(160deg,rgb(28,40,65),rgb(0,14,41))] opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  )
}

interface TourProps {
  data: TourenType
}
const Tour = ({ data }: TourProps) => {
  return (
    <motion.a
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1, opacity: 0 }}
      layout
      href={data.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group">
      <div className="grid">
        <Image imageId={data.featured_media} />
        <div className=" origin-center col-start-1 row-start-1 z-0 relative grid items-center text-shadow text-white lg:group-hover:underline-offset-8 group-hover:underline-offset-[3px] group-hover:underline font-medium text-2xl md:text-4xl lg:text-6xl px-4">
          <span>{data.title.rendered}</span>
        </div>
      </div>
    </motion.a>
  )
}

export default Touren
