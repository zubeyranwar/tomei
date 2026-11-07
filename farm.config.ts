import { defineConfig } from '@farm.js/core'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  srcDir: '.',
  vite: {
    plugins: [
      tailwindcss(),
      {
        enforce: 'pre',
        ...mdx({ remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter] }),
      },
    ],
  },
})
