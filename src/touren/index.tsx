import { Dispatch, useEffect, useState, SetStateAction } from 'react'
import { useImage, useTouren } from './queries'
import type { TourenType, Acf, MediaType } from './datatype'

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
const Selection = ({ setState, name, value, options }: SelectionType) => {
  return (
    <select
      className="capitalize px-4 py-2 bg-transparent border rounded border-gray-300 hover:border-gray-400"
      onChange={(e) => setState(e.target.value)}
      value={value || ''}>
      <option className="bg-white hover:bg-slate-500 capitalize" value="">
        {name}
      </option>
      {options.map((v) => (
        <option className="bg-white hover:bg-slate-500" value={v} key={v}>
          {v}
        </option>
      ))}
    </select>
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
    <div className="grid grid-cols-2 max-w-lg gap-x-3 gap-y-2 mx-auto pt-2 mb-10 ">
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
        {data.map((x) => (
          <Tour key={x.slug} data={x} />
        ))}
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
    <div className="relative col-start-1 row-start-1 z-0">
      <span
        className="block"
        style={{
          aspectRatio: `${image.data.media_details.sizes.medium_large.width} / ${image.data.media_details.sizes.medium_large.height}`
        }}></span>
      <img
        loading="lazy"
        className="absolute inset-0 z-0"
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
    <a
      href={data.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group">
      <div className="grid">
        <Image imageId={data.featured_media} />
        <div className="col-start-1 row-start-1 z-0 relative grid items-center text-shadow text-white group-hover:underline-offset-8 group-hover:underline font-medium text-2xl md:text-4xl lg:text-6xl px-4">
          <span>{data.title.rendered}</span>
        </div>
      </div>
    </a>
  )
}

export default Touren
