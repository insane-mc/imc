import { isEmpty } from 'lodash'

import { Item } from './item'
import { Event } from './event'
import { Advancement } from './advancement'
import { stringifyRawText } from '../types'
import { Element, ElementMeta } from '../element'
import { Context, BuildResult } from '../context'


export type RecipeMaterial = Array<RecipeMaterial> | {
	item: string
} | {
	tag: string
}

export interface RecipeData {
	type?: string
	group?: string

	// minecraft:crafting_shaped
	pattern?: Array<string>
	key?: {
		[keyName: string]: RecipeMaterial
	}
	result?: {
		item: string
		count?: number
	}

	__displayName__?: string
}

export type RecipeMaterialMeta = null | string | Item | RecipeMaterial
export interface RecipeMeta extends ElementMeta {
	data?: RecipeData

	name?: string
	displayName?: string
	recipe?: Array<Array<RecipeMaterialMeta>>
	result?: string | Item | { item: string }
	resultCount?: number
}


const RecipePatternString = [
	['&', 'U', '%'],
	['L', 'O', 'R'],
	['#', 'D', '$'],
]


export class Recipe extends Element {
	data: RecipeData
	displayName: string

	private craftedEvent?: Event
	private craftedAdvancement?: Advancement

	private static fromMaterialMeta(meta: RecipeMaterialMeta): RecipeMaterial {
		if (typeof meta === 'string') {
			return { item: meta }
		}
		if (meta instanceof Item) {
			// WARN: NBT data would be ignored due to the limit of Minecraft
			return { item: meta.name }
		}
		return meta
	}


	on(eventName: 'crafted'): Event {
		if (eventName === 'crafted') {
			if (!this.craftedEvent) {
				this.craftedEvent = this.ctx.event({
					name: this.name,
					spec: 'recipe_crafted',
				})
				this.craftedAdvancement = this.ctx.advancement({
					name: this.name,
					spec: 'recipe_crafted',
					// hide: true,   // BUG?
					data: {
						criteria: {
							Unlocked: {
								trigger: 'minecraft:recipe_unlocked',
								conditions: { recipe: this.id }
							}
						},
						rewards: { function: this.craftedEvent.id }
					}
				})
				this.craftedEvent.trigger({
					level: -1,
					data: [
						`recipe take @s ${this.id}`,
						`advancement revoke @s only ${this.craftedAdvancement.id}`,
					].join('\n'),
				})
				this.ctx.on('load', [
					`recipe take @p ${this.id}`,
					`advancement revoke @p only ${this.craftedAdvancement.id}`,
				].join('\n'))
			}
			return this.craftedEvent
		}
		return
	}

	build(): BuildResult {
		return {
			path: `data/${this.namespace}/recipes/${this.path}.json`,
			data: this.ctx.stringifyJSON(this.data),
		}
	}


	constructor(meta: RecipeMeta, ctx?: Context) {
		super(meta, ctx, true)
		this.type = 'recipe'

		this.data.type = this.data.type || 'minecraft:crafting_shaped'

		if (this.data.type === 'minecraft:crafting_shaped') {
			if (meta.recipe) {
				this.data.key = {}
				this.data.pattern = []
				for (let i = 0; i < meta.recipe.length; i++) {
					let pattern = ''
					for (let j = 0; j < meta.recipe[i].length; j++) {
						if (meta.recipe[i][j]) {
							const key = RecipePatternString[i][j]
							this.data.key[key] = Recipe.fromMaterialMeta(meta.recipe[i][j])
							pattern += key
						} else {
							pattern += ' '
						}
					}
					this.data.pattern.push(pattern)
				}
			}

			if (meta.result) {
				if (!(meta.result instanceof Item) || isEmpty(meta.result)) {
					this.data.result = Recipe.fromMaterialMeta(meta.result) as unknown as { item: string }
					if (meta.resultCount) {
						this.data.result.count = meta.resultCount
					}

				} else {
					if (meta.result.data.display?.Name) {
						this.displayName = stringifyRawText(JSON.parse(meta.result.data.display.Name), true)
					}

					this.data.result = { item: 'minecraft:knowledge_book' }

					this.on('crafted').trigger([
						'clear @s minecraft:knowledge_book',
						meta.result.commandGive('@s'),
					].join('\n'))
				}
			}

			if (meta.displayName) { this.displayName = meta.displayName }
			if (this.displayName) {
				this.data.__displayName__ = this.displayName
			} else {
				this.displayName = this.id
			}
		}
	}
}
