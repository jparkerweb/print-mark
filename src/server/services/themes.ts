import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Theme, ThemeId } from '../../shared/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Theme metadata for all available themes
 */
const THEMES: Theme[] = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'Minimal, professional styling with generous white space. Perfect for documentation.',
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Traditional serif fonts with justified text. Ideal for essays and research papers.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle colored accents. Great for technical documentation.',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Optimized for maximum content per page. Small fonts and tight spacing.',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Bold, corporate look with strong visual hierarchy. Ideal for business documents.',
  },
  {
    id: 'manuscript',
    name: 'Manuscript',
    description: 'Traditional book style with classic serif typography. Perfect for literary content.',
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Optimized for code-heavy technical documentation. High contrast and mono-friendly.',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-clean design with maximum whitespace. For content that speaks for itself.',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Friendly layout with subtle decorative elements. Great for casual communications.',
  },
]

/**
 * Valid theme IDs for runtime validation
 */
const VALID_THEME_IDS: Set<ThemeId> = new Set([
  'clean', 'academic', 'modern', 'compact',
  'executive', 'manuscript', 'technical', 'minimalist', 'newsletter'
])

/**
 * ThemeService provides access to theme metadata and CSS content
 */
export class ThemeService {
  private cssCache: Map<ThemeId, string> = new Map()

  /**
   * Get all available themes with their metadata
   */
  getThemes(): Theme[] {
    return THEMES
  }

  /**
   * Check if a theme ID is valid
   */
  isValidThemeId(themeId: string): themeId is ThemeId {
    return VALID_THEME_IDS.has(themeId as ThemeId)
  }

  /**
   * Get the CSS content for a specific theme
   * Includes the base CSS and theme-specific overrides
   * Results are cached in memory for performance
   *
   * @param themeId - The theme identifier
   * @returns The complete CSS for the theme
   * @throws Error if the theme ID is unknown
   */
  async getThemeCSS(themeId: ThemeId): Promise<string> {
    // Validate theme ID
    if (!this.isValidThemeId(themeId)) {
      throw new Error(`Unknown theme ID: ${themeId}`)
    }

    // Check cache first
    const cached = this.cssCache.get(themeId)
    if (cached) {
      return cached
    }

    // Build path to theme CSS file
    // In production, CSS files are in dist/client/styles/themes/
    const themesDir = join(__dirname, '../../client/styles/themes')
    const baseCssPath = join(themesDir, '_base.css')
    const themeCssPath = join(themesDir, `${themeId}.css`)

    try {
      // Read both base and theme CSS files
      const [baseCSS, themeCSS] = await Promise.all([
        readFile(baseCssPath, 'utf-8'),
        readFile(themeCssPath, 'utf-8'),
      ])

      // Remove the @import statement from the theme CSS since we're including base directly
      const themeCSSWithoutImport = themeCSS.replace(/@import\s+['"]\.?\/?_base\.css['"];?\s*/g, '')

      // Combine base and theme CSS
      const combinedCSS = `/* Base Styles */\n${baseCSS}\n\n/* Theme: ${themeId} */\n${themeCSSWithoutImport}`

      // Cache the result
      this.cssCache.set(themeId, combinedCSS)

      return combinedCSS
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to load CSS for theme "${themeId}": ${message}`)
    }
  }

  /**
   * Clear the CSS cache (useful for development/testing)
   */
  clearCache(): void {
    this.cssCache.clear()
  }
}

// Export singleton instance
export const themeService = new ThemeService()
