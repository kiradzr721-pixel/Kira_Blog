import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Lightweight utility to concatenate multiple css classnames separated by spaces; omits falsey values.
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(' ')
}

/**
 * Extended tailwind-merge.
 * Register any custom classes and utilities here so they can be merged correctly.
 */
const twMerge = extendTailwindMerge({
	override: {},
	extend: {
		classGroups: {
			'font-size': [
				// built-in font sizes
				'text-xs',
				'text-s',
				'text-m',
				'text-l',
				'text-2xl',

				// custom theme addition
				'text-tiny',
			],
		},
		// custom variants
		orderSensitiveModifiers: ['hover-mouse', 'hocus', 'hocus-mouse'],
	},
})

export function cn(...args: ClassValue[]): string {
	return twMerge(clsx(args))
}
