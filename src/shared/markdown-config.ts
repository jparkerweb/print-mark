import type MarkdownIt from 'markdown-it'

export interface MarkdownConfig {
  html: boolean
  linkify: boolean
  typographer: boolean
  breaks: boolean
}

export interface AnchorOptions {
  permalink: boolean
  level: number[]
}

export const defaultMarkdownConfig: MarkdownConfig = {
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
}

export const pluginNames = ['anchor', 'task-lists', 'footnote'] as const

export type PluginName = (typeof pluginNames)[number]

export const anchorOptions: AnchorOptions = {
  permalink: false,
  level: [1, 2, 3, 4],
}

export type MarkdownItInstance = MarkdownIt
