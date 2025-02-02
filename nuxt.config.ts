// https://nuxt.com/docs/api/configuration/nuxt-config
import yaml from '@rollup/plugin-yaml';
import svgLoader from 'vite-svg-loader';
import genSitemap from './scripts/gen-sitemap';
import { genApiTranslationFiles } from './scripts/gen-api-translations';
import type { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { genLocalesJson } from './scripts/gen-locales';

// 公開時のドメイン（末尾スラッシュなし）
const baseUrl = 'https://misskey-hub.net';

// 言語定義
export const localesConst = [
	{ files: [ 'ja-JP.json' ], code: 'ja', iso: 'ja-JP', name: '日本語' },
	{ files: [ 'en-US.json' ], code: 'en', iso: 'en-US', name: 'English' },
	{ files: [ 'id-ID.json' ], code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia' },
	{ files: [ 'ko-KR.json' ], code: 'ko', iso: 'ko-KR', name: '한국어' },
	{ files: [ 'it-IT.json' ], code: 'it', iso: 'it-IT', name: 'Italiano' },
	{ files: [ 'pl-PL.json' ], code: 'pl', iso: 'pl-PL', name: 'Polski' },
	{ files: [ 'fr-FR.json' ], code: 'fr', iso: 'fr-FR', name: 'Français' },
	{ files: [ 'zh-CN.json' ], code: 'cn', iso: 'zh-CN', name: '简体中文' },
	{ files: [ 'zh-TW.json' ], code: 'tw', iso: 'zh-TW', name: '繁体中文' },
] as const;

export type LocaleCodes = typeof localesConst[number]['code'];

export const locales = localesConst as unknown as LocaleObject[];

export default defineNuxtConfig({
	runtimeConfig: {
		locales,
		public: {
			baseUrl,
		}
	},
	css: [
		"github-markdown-css/github-markdown.css",
		"@/assets/css/nprogress.css",
		"@/assets/css/tailwind.css",
		"@/assets/css/bootstrap-forms.scss",
	],
	modules: [
		'@nuxt/content',
		'@nuxtjs/i18n',
		'@nuxtjs/color-mode',
	],
	app: {
		head: {
			link: [
				{ rel: 'stylesheet', href: '/fonts/fonts.css' },
			],
		},
	},
	content: {
		navigation: {
			fields: [
				'date',
				'description',
			]
		},
		highlight: {
			preload: [
				'ini',
			],
			theme: {
				// Default theme (same as single string)
				default: 'github-light',
				// Theme used if `html.dark`
				dark: 'github-dark',
			},
		},
	},
	i18n: {
		baseUrl,
		vueI18n: './i18n.config.ts',
		locales,
		lazy: true,
		langDir: 'locales_dist',
		defaultLocale: 'ja',
		strategy: 'prefix',
		detectBrowserLanguage: {
			fallbackLocale: 'ja',
		},
		trailingSlash: true,
	},
	colorMode: {
		classSuffix: '',
	},
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	alias: {
		'bi': 'bootstrap-icons/icons',
	},
	vite: {
		plugins: [
			yaml(),
			svgLoader({
				defaultImport: 'component',
				svgoConfig: {
					plugins: [
						{
							name: 'preset-default',
							params: {
								overrides: {
									removeViewBox: false,
								}
							}
						}
					]
				}
			}),
		],
	},
	nitro: {
		hooks: {
			'compiled': genSitemap,
		},
		prerender: {
			routes: [
				"/404.html"
			],
			// 【一時対応】とりあえずビルドできるようにする
			failOnError: false,
		},
		plugins: [
			'@/server/plugins/appendComment.ts',
			'@/server/plugins/i18nRedirector.ts',
		],
	},
	hooks: {
		'build:before': (...args) => {
			genApiTranslationFiles(...args);
			genLocalesJson(...args);
		},
	},
	experimental: {
		inlineSSRStyles: false,
		payloadExtraction: true,
		componentIslands: true,
	},
})
