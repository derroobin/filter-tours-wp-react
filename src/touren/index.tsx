import {
  Dispatch,
  useEffect,
  useState,
  SetStateAction,
  useRef,
  Suspense,
  lazy
} from 'react'
import { useTouren } from './queries'
import type { TourenType, Acf } from './datatype'
import { AnimatePresence, motion as m } from 'framer-motion'
import {
  RovingTabIndexProvider,
  useRovingTabIndex,
  useFocusEffect
} from 'react-roving-tabindex'
import { Placeholder } from './placeholder'

const Image = lazy(() => import('./image'))

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
        className="cursor-pointer block focus:bg-blue-400 hover:bg-blue-400 hover:ring-2 focus:ring-2 ring-blue-700 w-full text-left px-4 py-2 rounded-md overflow-visible"
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
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 max-w-[90rem] gap-x-3 gap-y-2 pt-2 mb-10 px-4">
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
          {data.map((x, idx) => (
            <Tour key={x.slug} data={x} idx={idx} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface TourProps {
  data: TourenType
  idx: number
}
const Tour = ({ data, idx }: TourProps) => {
  return (
    <m.a
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1, opacity: 0 }}
      layout
      href={data.link}
      className="group">
      <div className="grid">
        <Suspense fallback={<Placeholder />}>
          <Image imageId={data.featured_media} idx={idx} />
        </Suspense>
        <div className=" origin-center col-start-1 row-start-1 z-0 relative grid items-center text-shadow text-white lg:group-hover:underline-offset-8 group-hover:underline-offset-[3px] group-hover:underline font-medium text-3xl md:text-5xl lg:text-6xl xl:text-8xl px-4">
          <span>{data.title.rendered}</span>
        </div>
      </div>
    </m.a>
  )
}

export default Touren
