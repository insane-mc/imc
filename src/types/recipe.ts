import { Element, ElementMeta } from '../element'
import { Context } from '../context'
import { Item } from './item'


export type RecipeMaterial = Array<RecipeMaterial> | {
	item: string
} | {
	tag: string
}

export interface RecipeData {
	type?: string
	group?: string

	// minecraft:crafting_shaped
	pattern?: [string, string, string]
	key?: {
		[keyName: string]: RecipeMaterial
	}
	result?: {
		item: string
		count?: number
	}
}

export type RecipeMaterialMeta = null | string | Item | RecipeMaterial
export interface RecipeMeta extends ElementMeta {
	data?: RecipeData

	name?: string
	recipe?: [
		[RecipeMaterialMeta, RecipeMaterialMeta, RecipeMaterialMeta],
		[RecipeMaterialMeta, RecipeMaterialMeta, RecipeMaterialMeta],
		[RecipeMaterialMeta, RecipeMaterialMeta, RecipeMaterialMeta],
	]
	result?: string | Item | { item: string }
	resultCount: number
}


export class Recipe extends Element {
	data: RecipeData


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


	compile() {
		return {
			dir: `data/${this.namespace}/recipes/${this.path}.json`,
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
				this.data.pattern = ['', '', '']
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						if (meta.recipe[i][j]) {
							const key = String.fromCharCode(65 + i * 3 + j)
							this.data.pattern[i] += key
							this.data.key[key] = Recipe.fromMaterialMeta(meta.recipe[i][j])
						} else {
							this.data.pattern[i] += ' '
						}
					}
				}
			}

			if (meta.result) {
				this.data.result = Recipe.fromMaterialMeta(meta.result) as unknown as { item: string }
				if (meta.resultCount) {
					this.data.result.count = meta.resultCount
				}
			}
		}
	}
}
