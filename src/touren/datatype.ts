export interface TourenType {
  id: number
  date: string
  date_gmt: string
  guid: GUID
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: GUID
  content: Content
  excerpt: Content
  author: number
  featured_media: number
  parent: number
  menu_order: number
  comment_status: string
  ping_status: string
  template: string
  meta: { [key: string]: Meta }
  acf: Acf
  _links: Links
}

export interface Links {
  self: About[]
  collection: About[]
  about: About[]
  author: Author[]
  replies: Author[]
  'version-history': VersionHistory[]
  'predecessor-version': PredecessorVersion[]
  up: Author[]
  'wp:attachment': About[]
  curies: Cury[]
  'wp:featuredmedia'?: Author[]
}

export interface About {
  href: string
}

export interface Author {
  embeddable: boolean
  href: string
}

export interface Cury {
  name: string
  href: string
  templated: boolean
}

export interface PredecessorVersion {
  id: number
  href: string
}

export interface VersionHistory {
  count: number
  href: string
}

export interface Acf {
  land?: string
  region?: string
  gipfelhoehe?: string
  hoehenmeter?: string
  dauer?: string
  schwierigkeit?: string
}

export interface Content {
  rendered: string
  protected: boolean
}

export interface GUID {
  rendered: string
}

export enum Meta {
  Disabled = 'disabled',
  Empty = '',
  Enabled = 'enabled',
  NoSidebar = 'no-sidebar',
  PageBuilder = 'page-builder'
}
