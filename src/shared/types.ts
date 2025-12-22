export type ThemeId = 'clean' | 'academic' | 'modern' | 'compact' | 'executive' | 'manuscript' | 'technical' | 'minimalist' | 'newsletter'

export interface Theme {
  id: string
  name: string
  description: string
}

export interface PDFOptions {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'B5'
  margins: 'normal' | 'narrow' | 'wide'
  includePageNumbers: boolean
}

export interface PDFRequest {
  markdown: string
  theme: ThemeId
  options: PDFOptions
}

export interface UploadResponse {
  filename: string
  content: string
  size: number
}

export interface HealthResponse {
  status: 'healthy'
  version: string
}

export interface MarkdownRenderOptions {
  sanitize?: boolean
}

export type { SanitizeConfig } from './sanitize-config.js'
