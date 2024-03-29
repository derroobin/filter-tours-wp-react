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

import bergab from '../assets/icons/Bergab.png'
import bergauf from '../assets/icons/Bergauf.png'
import dauer from '../assets/icons/Dauer.png'
import erfahrung from '../assets/icons/Erfahrung.png'
import gipfelhoehe from '../assets/icons/Gipfelhoehe.png'
import jahreszeit from '../assets/icons/Jahreszeit.png'
import klettersteig from '../assets/icons/Klettersteig.png'
import land from '../assets/icons/Land_und_Region.png'
import strecke from '../assets/icons/Strecke.png'
import technik from '../assets/icons/Technik.png'
import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '../lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js'
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit'
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js'
  },
  {
    value: 'remix',
    label: 'Remix'
  },
  {
    value: 'astro',
    label: 'Astro'
  }
]

const Selection = ({ setState, name, value, options, type }: SelectionType) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto capitalize font-semibold text-ellipsis whitespace-nowrap overflow-hidden border-[3px] rounded-full text-center border-black group-hover:shadow-[rgba(0,0,0,0.13)_0px_7px_15px,rgba(0,0,0,0.05)_0px_0px_3px] transition-shadow duration-300 ease-in-out px-8 py-4 w-full text-lg bg-white cursor-pointer">
          {value || name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[80vw] max-w-[550px] p-0 border-solid border-[3px] border-black outline-0">
        <Command className="">
          <CommandInput placeholder={`Suche..`} className="text-lg" />
          <CommandEmpty>Keine Ergebnisse</CommandEmpty>
          <CommandGroup>
            {options.map((framework) => (
              <CommandItem
                key={framework}
                className="aria-selected:bg-blue-400 text-left font-semibold  text-lg py-4"
                onSelect={() => {
                  setState((current) => {
                    console.log('cv', framework)
                    const newPartial: FilterSettings = {}
                    newPartial[type] =
                      framework === value ? undefined : framework || undefined
                    return { ...current, ...newPartial }
                  })
                  setOpen(false)
                }}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === framework ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {framework}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const Image = lazy(() => import('./image'))

type FilterOuterProps = {
  state: FilterSettings
  setState: Dispatch<SetStateAction<FilterSettings>>
  options: FilterProps
}

type keyofAcf = keyof Pick<
  Acf,
  | 'dauer'
  | 'hoehenmeter'
  | 'land'
  | 'gipfelhoehe'
  | 'schwierigkeit'
  | 'region'
  | 'art'
  | 'berg'
>
type FilterProps = Record<`${keyofAcf}s`, Array<string>>

interface SelectionType {
  options: string[]
  value: string | null | undefined
  setState: Dispatch<SetStateAction<FilterSettings>>
  name: string
  type: keyof Acf
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
    dauers,
    arts,
    bergs
  }
}: FilterOuterProps) => {
  const showDeleteButton = useMemo(
    () => Object.values(state).filter((x) => !!x).length > 0,
    [state]
  )
  return (
    <div className="grid mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 max-w-[100rem] gap-x-3 gap-y-5 pt-2 mb-10 px-4">
      <Selection
        type="art"
        name="tourenart"
        options={arts}
        setState={setState}
        value={state.art}
      />
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
      {regions.length ? (
        <Selection
          type="region"
          name="region"
          options={regions}
          setState={setState}
          value={state.region}
        />
      ) : null}
      {bergs.length ? (
        <Selection
          type="berg"
          name="berg"
          options={bergs}
          setState={setState}
          value={state.berg}
        />
      ) : null}
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
          className="underline underline-offset-2 text-blue-600 hover:text-blue-400 text-left pl-2 !bg-white"
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
  'region',
  'art'
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
          if (acf.berg) {
            console.log(acf.berg, state.berg)
            console.log(acf.schwierigkeit, state.schwierigkeit)
          }
          if (state.land && !acf.land?.includes(state.land)) {
            return false
          }

          if (
            state.gipfelhoehe &&
            !acf.gipfelhoehe?.includes(state.gipfelhoehe)
          ) {
            return false
          }

          if (state.region && !acf.region?.includes(state.region)) {
            return false
          }

          if (
            state.hoehenmeter &&
            !acf.hoehenmeter?.includes(state.hoehenmeter)
          ) {
            return false
          }

          if (
            state.schwierigkeit &&
            !acf.schwierigkeit?.includes(state.schwierigkeit)
          ) {
            return false
          }
          if (state.dauer && !acf.dauer?.includes(state.dauer)) {
            return false
          }

          if (state.art && !acf.art?.includes(state.art)) {
            return false
          }

          if (state.berg && !acf.berg?.includes(state.berg)) {
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

const heightRegex = /^(\D{0,1})(\d{3,4})/

const dauerRegex = /^(\D{0,1})(\d{1,2})/

const getNumber = (str: string, store: Map<string, number>, regex: RegExp) => {
  const storeVal = store.get(str)
  if (storeVal) {
    return storeVal
  }
  const numStr = str.match(regex)

  if (!numStr || numStr.length <= 1) {
    return 99999
  }
  const num =
    Number.parseInt(numStr[2]) +
    (numStr[1] === '<' ? -1 : numStr[1] === '>' ? 1 : 0)
  if (!num || Number.isNaN(numStr)) {
    return 9999
  }

  store.set(str, num)

  return num
}

const sortHeights = (arr: string[], regex: RegExp) => {
  const store = new Map<string, number>()

  return arr.sort((a, b) => {
    const numA = getNumber(a, store, regex)
    const numB = getNumber(b, store, regex)

    return numA - numB
  })
}

const addElement = (set: Set<string>, element?: string | Array<string>) => {
  if (!element) return

  if (Array.isArray(element)) {
    for (let e of element) {
      set.add(e)
    }
    return
  }

  set.add(element)
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
    dauers: [],
    arts: [],
    bergs: []
  })
  useEffect(() => {
    if (data.data) {
      const land = new Set<string>()
      const schwierigkeit = new Set<string>()
      const region = new Set<string>()
      const dauer = new Set<string>()
      const gipfelhoehe = new Set<string>()
      const hoehenmeter = new Set<string>()
      const art = new Set<string>()
      const berg = new Set<string>()

      for (let i = 0; i < data.data.length; i++) {
        const acf = data.data[i].acf
        addElement(region, acf.region)
        addElement(schwierigkeit, acf.schwierigkeit)
        addElement(land, acf.land)
        addElement(gipfelhoehe, acf.gipfelhoehe)
        addElement(hoehenmeter, acf.hoehenmeter)
        addElement(dauer, acf.dauer)
        addElement(art, acf.art)
        addElement(berg, acf.berg)
      }

      setOptions({
        dauers: sortHeights(Array.from(dauer), dauerRegex),
        lands: Array.from(land).sort(),
        hoehenmeters: sortHeights(Array.from(hoehenmeter), heightRegex),
        gipfelhoehes: sortHeights(Array.from(gipfelhoehe), heightRegex),
        regions: Array.from(region).sort(),
        schwierigkeits: Array.from(schwierigkeit).sort(),
        arts: Array.from(art).sort(),
        bergs: Array.from(berg).sort()
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
          {data.length === 0 ? (
            <h2 className="text-center">Keine Touren verfügbar</h2>
          ) : (
            data.map((x, idx) => <Tour key={x.slug} data={x} idx={idx} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface TourProps {
  data: TourenType
  idx: number
}

// extracts images from tour data
const useExtractImages = (data: TourProps['data']) => {
  const {
    bild1,
    bild2,
    bild3,
    bild4,
    bild5,
    bild6,
    bild7,
    bild8,
    bild9,
    bild10
  } = data.acf

  return [
    bild1,
    bild2,
    bild3,
    bild4,
    bild5,
    bild6,
    bild7,
    bild8,
    bild9,
    bild10
  ].filter(Boolean)
}

type InfoIcon = { icon: string; text?: string; alt: string }
const Tour = ({ data, idx }: TourProps) => {
  const infos: InfoIcon[] = [
    {
      icon: bergauf,
      alt: 'Höhenmeter',
      text: data.acf.i_hoehenmeter
    },
    { icon: gipfelhoehe, text: data.acf.i_gipfelhoehe, alt: 'Gipfelhöhe' },
    { icon: dauer, text: data.acf.i_dauer, alt: 'Dauer' },
    { icon: technik, text: data.acf.i_schwierigkeit, alt: 'Schwierigkeit' },
    { icon: land, text: data.acf.i_land, alt: 'Land' }
  ]

  const images = useExtractImages(data)
  return (
    <m.div
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1, opacity: 0 }}
      layout
      className="grid group overflow-hidden">
      <Suspense fallback={<Placeholder />}>
        <Image imageIds={images} idx={idx} />
      </Suspense>
      <div className="mx-20 origin-center col-start-1 row-start-1 z-0 relative grid items-center text-shadow text-white lg:hover:underline-offset-8 hover:underline-offset-[3px] hover:underline font-medium text-3xl md:text-5xl lg:text-6xl xl:text-8xl px-4">
        <a
          className="hyphens absolute left-2 right-0 top-0 bottom-0 flex items-center"
          href={data.link}>
          <span>{data.title.rendered}</span>
        </a>
        <div className="absolute -bottom-5 pb-6 lg:pb-8 -left-20 -right-20 opacity-100 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-xs md:text-sm overflow-y-auto snap-x">
          <div className="px-4 flex flex-row min-w-max items-center justify-end gap-4 lg:gap-6">
            {infos.map(({ icon, text, alt }) => {
              if (!text) return null
              return (
                <div
                  key={icon}
                  title={alt}
                  className="snap-center flex-shrink-0 flex  flex-row gap-1 items-center  text-black px-4 py-2 rounded-xl text-shadow-none bg-white/60 backdrop-blur-sm">
                  <img src={icon} className="!h-3" alt={alt} />
                  <span>{text}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </m.div>
  )
}

export default Touren
