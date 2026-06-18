import type { AstroUserConfig } from 'astro'
import { defineConfig, fontProviders } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import { rehypeWrapTables } from './plugins/rehype/rehype-wrap-tables'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const ASTRO_SITE = (
	process.env.CF_PAGES_URL ? `https://${process.env.CF_PAGES_URL}`
	: process.env.SITE_URL ? process.env.SITE_URL
	: 'http://localhost:4321'
) satisfies AstroUserConfig['site']

/**
 * Astro v6 static site config for Cloudflare Pages.
 *
 * @see https://astro.build/config
 */
export default defineConfig({
	site: ASTRO_SITE,
	base: '/',
	trailingSlash: 'ignore',
	output: 'static',
	devToolbar: {
		enabled: false,
	},
	build: {
		format: 'directory',
	},
	integrations: [
		mdx(),
		sitemap({
			// example filter to remove `/api` routes from the sitemap (customize as required)
			// filter: (page) => {
			// 	return ![/^https?:\/\/[^/]+\/api(\/|$)/].some((pattern) => pattern.test(page))
			// },
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ['astro/runtime/client/dev-toolbar/entrypoint'],
		},
	},
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	image: {
		domains: process.env.CF_PAGES_URL ? [process.env.CF_PAGES_URL] : [],
		remotePatterns: [],
		responsiveStyles: false,
		service: {
			entrypoint: 'astro/assets/services/noop',
		},
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Atkinson Hyperlegible Next',
			cssVariable: '--font-atkinson-next',
			weights: ['200 800'],
			styles: ['normal', 'italic'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Atkinson Hyperlegible Mono',
			cssVariable: '--font-atkinson-mono',
			weights: ['600 800'],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],

	/**
	 * Warning: Astro's new `security.csp` feature is not compatible with shiki and the documented
	 * alternative of Prism is currently not compatible with the Cloudflare Workers runtime (workerd).
	 *
	 * @see https://docs.astro.build/en/reference/configuration-reference/#security
	 */
	security: {
		csp: false,
		checkOrigin: true,
		actionBodySizeLimit: 2 * 1024 * 1024, // 2 MB
		serverIslandBodySizeLimit: 1 * 1024 * 1024, // 1 MB
		allowedDomains: [
			{
				hostname: 'localhost',
				protocol: 'http',
			},
			{
				hostname: process.env.CF_PAGES_URL || 'localhost',
				protocol: 'https',
			},
		],
	},

	/**
	 * Warning: Astro's new `security.csp` feature is not compatible with shiki and the documented
	 * alternative of Prism is currently not compatible with the Cloudflare Workers runtime (workerd).
	 *
	 * @see https://docs.astro.build/en/reference/configuration-reference/#markdown-options
	 */
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark-dimmed' },
			wrap: false,
		},
		remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeWrapTables, rehypeKatex],
	},
})
