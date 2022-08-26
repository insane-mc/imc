import md5 from 'md5'
import { Stream } from 'stream'
import { cloneDeep } from 'lodash'

import { NamespaceID } from './types/interface'
import { Context } from './context'

export interface ElementMeta {
	data?: any
	path?: string
	name?: string
}

export class ElementCompileResult {
	dir?: string
	data?: string | Stream
}

export class Element {
	ctx: Context
	type: keyof ElementCollection
	data?: any
	name?: string

	id: NamespaceID
	namespace?: string
	path?: string


	constructor(meta: ElementMeta, ctx?: Context, flatPath?: boolean) {
		this.data = meta.data ? cloneDeep(meta.data) : {}
		this.ctx = ctx ? ctx : new Context()

		if (meta.name) {
			this.name = meta.name
		} else {
			this.name = md5(Math.random())
		}

		this.id = this.ctx.id(this.name, {
			flat: flatPath ? true : false
		})
		this.namespace = this.id.split(':', 2)[0]
		this.path = this.id.split(':', 2)[1]

		this.ctx.logger.scope('element').debug(this.namespace,this.path,this.id)
	}
}


export type ElementCreater<T extends Element> = { new(meta: any, ctx: Context): T }


import { Advancement, AdvancementMeta } from './types/advancement'
import { Item, ItemMeta } from './types/item'
import { Recipe, RecipeMeta } from './types/recipe'

export class ElementCollection {
	advancement: Advancement
	item: Item
	recipe: Recipe
}

export class ElementMetaCollection {
	advancement: AdvancementMeta
	item: ItemMeta
	recipe: RecipeMeta
}

export type ElementName = keyof ElementCollection 