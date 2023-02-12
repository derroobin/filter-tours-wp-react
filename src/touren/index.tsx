import {
  Dispatch,
  useEffect,
  useState,
  SetStateAction,
  useRef,
  Suspense,
  lazy,
  useMemo
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

type FilterOuterProps = {
  state: FilterSettings
  setState: Dispatch<SetStateAction<FilterSettings>>
  options: FilterProps
}

type FilterProps = Record<`${keyof Acf}s`, Array<string>>

interface SelectionType {
  options: string[]
  value: string | null | undefined
  setState: Dispatch<SetStateAction<FilterSettings>>
  name: string
  type: keyof Acf
}

const Option = ({
  setState,
  type,
  value,
  option,
  disabled = false
}: Omit<SelectionType, 'options'> & {
  option: null | string
  idx: number
  disabled?: boolean
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabIndex(
    ref,
    disabled
  )
  useFocusEffect(focused, ref)
  // blabla
  return (
    <li className="list-none">
      <span
        className="cursor-pointer block focus:bg-blue-400 hover:bg-blue-400 hover:ring-2 focus:ring-2 ring-blue-700 w-full text-left px-4 py-2 rounded-md overflow-visible"
        ref={ref}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          handleClick()
          setState((current) => {
            const newPartial: FilterSettings = {}
            newPartial[type] = option || undefined
            return { ...current, ...newPartial }
          })
          ref.current?.blur()
        }}>
        {option || 'abwählen'}
      </span>
    </li>
  )
}
//
const Selection = ({ setState, name, value, options, type }: SelectionType) => {
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
                type={type}
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
          onClick={() =>
            setState((current) => {
              current[type] = undefined
              return { ...current }
            })
          }
          className="absolute right-1 aspect-square h-12 top-1/2 -translate-y-1/2 hover:bg-gray-400 rounded-full"
          aria-label="Auswahl leeren">
          x
        </button>
      ) : null}
    </div>
  )
}

const Filter = ({
  state,
  setState,
  options: {
    lands,
    regions,
    schwierigkeits,
    gipfelhoehes,
    hoehenmeters,
    dauers
  }
}: FilterOuterProps) => {
  const showDeleteButton = useMemo(
    () => Object.values(state).filter((x) => !!x).length > 0,
    [state]
  )
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 max-w-[90rem] gap-x-3 gap-y-2 pt-2 mb-10 px-4">
      <Selection
        type="dauer"
        name="dauer"
        options={dauers}
        setState={setState}
        value={state.dauer}
      />
      <Selection
        type="schwierigkeit"
        name="schwierigkeit"
        options={schwierigkeits}
        setState={setState}
        value={state.schwierigkeit}
      />
      <Selection
        type="land"
        name="land"
        options={lands}
        setState={setState}
        value={state.land}
      />
      <Selection
        type="region"
        name="region"
        options={regions}
        setState={setState}
        value={state.region}
      />
      <Selection
        type="gipfelhoehe"
        name="gipfelhöhe"
        options={gipfelhoehes}
        setState={setState}
        value={state.gipfelhoehe}
      />
      <Selection
        type="hoehenmeter"
        name="höhenmeter"
        options={hoehenmeters}
        setState={setState}
        value={state.hoehenmeter}
      />
      {showDeleteButton ? (
        <button
          className="underline underline-offset-2 text-blue-600 hover:text-blue-400 text-left pl-2"
          onClick={() => setState({})}>
          Alle Filter löschen
        </button>
      ) : null}
    </div>
  )
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
const availableSettings: Array<keyof Acf> = [
  'dauer',
  'hoehenmeter',
  'land',
  'gipfelhoehe',
  'schwierigkeit',
  'region'
]

type FilterSettings = { [key in keyof Acf]: string }

const getSettingsFromUrl = (url: URL) => {
  const res: FilterSettings = {}
  for (const filter of availableSettings) {
    const x = url.searchParams.get(filter)
    if (x) {
      res[filter] = x
    }
  }
  return res
}

const useFilter = () => {
  const url = useURL()
  const [state, setState] = useState<FilterSettings>(getSettingsFromUrl(url))
  useEffect(() => {
    const filter = getSettingsFromUrl(url)
    setState(filter)
  }, [url])

  const all = useTouren()
  const options = useOptions()

  const [filtered, setFiltered] = useState<TourenType[]>([])

  // filters data
  useEffect(() => {
    if (all.data) {
      setFiltered(
        all.data.filter(({ acf }) => {
          if (state.land && state.land !== acf.land) {
            return false
          }

          if (state.gipfelhoehe && state.gipfelhoehe !== acf.gipfelhoehe) {
            return false
          }

          if (state.region && state.region !== acf.region) {
            return false
          }

          if (state.hoehenmeter && state.hoehenmeter !== acf.hoehenmeter) {
            return false
          }

          if (
            state.schwierigkeit &&
            state.schwierigkeit !== acf.schwierigkeit
          ) {
            return false
          }
          if (state.dauer && state.dauer !== acf.dauer) {
            return false
          }

          return true
        })
      )
    }
  }, [all.data, state])

  // handles setting of options to url
  useEffect(() => {
    const url = new URL(window.location.href)
    availableSettings.forEach((key) => {
      const value = state[key]
      if (value !== url.searchParams.get(key)) {
        if (value) {
          url.searchParams.set(key, value)
        } else {
          url.searchParams.delete(key)
        }
      }
    })

    history.replaceState({}, '', url)
  }, [state])

  return {
    data: filtered,
    Filter: Filter({
      state,
      setState,
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
    <m.div
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1, opacity: 0 }}
      layout
      className="grid">
      <Suspense fallback={<Placeholder />}>
        <Image imageId={data.featured_media} idx={idx} />
      </Suspense>
      <div className="mx-20 origin-center col-start-1 row-start-1 z-0 relative grid items-center text-shadow text-white lg:hover:underline-offset-8 hover:underline-offset-[3px] hover:underline font-medium text-3xl md:text-5xl lg:text-6xl xl:text-8xl px-4">
        <a href={data.link}>{data.title.rendered}</a>
      </div>
    </m.div>
  )
}

export default Touren
