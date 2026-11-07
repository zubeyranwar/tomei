import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const config: NextConfig = {
  agentRules: false,
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm', 'remark-frontmatter', ['remark-mdx-frontmatter', {}]],
  },
})

export default withMDX(config)
