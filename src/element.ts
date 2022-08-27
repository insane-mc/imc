import md5 from 'md5'
import { Stream } from 'stream'
import { cloneDeep } from 'lodash'

import { Context } from './context'
import { NamespaceID } from './types'


export interface ElementMeta {
	data?: any
	path?: string

	id?: string
	spec?: string
	name?: string
}

export class ElementCompileResult {
	dir?: string
	data?: string | Stream
}

export class Element {
	ctx: Context
	type: keyof ElementCollection
	data: any

	id: NamespaceID
	namespace?: string
	path?: string
	dir?: string
	name?: string


	constructor(meta: ElementMeta, ctx?: Context, flatPath?: boolean) {
		this.data = meta.data ? cloneDeep(meta.data) : {}
		this.ctx = ctx ? ctx : new Context()

		if (meta.id) {
			this.id = meta.id
		} else {
			if (meta.name) {
				this.name = meta.name
			} else {
				this.name = md5(Math.random())
			}
			this.id = this.ctx.id(this.name, {
				flat: flatPath ? true : false,
				spec: meta.spec,
			})
		}

		const idSplited = this.id.split(':', 2)
		this.namespace = idSplited[0]
		this.path = idSplited[1]
		const pathSplited = this.path.split('/')
		this.dir = pathSplited.slice(0, -1).join('/')
		this.name = pathSplited[pathSplited.length - 1]

		this.ctx.logger.scope('element').debug(this.type, this.id)
	}
}


export type ElementCreater<T extends Element> = { new(meta: any, ctx: Context): T }



import { Advancement, AdvancementMeta } from './modules/advancement'
import { Event, EventMeta } from './modules/event'
import { Item, ItemMeta } from './modules/item'
import { Recipe, RecipeMeta } from './modules/recipe'

export class ElementCollection {
	advancement: Advancement
	event: Event
	item: Item
	recipe: Recipe
}

export class ElementMetaCollection {
	advancement: AdvancementMeta
	event: EventMeta
	item: ItemMeta
	recipe: RecipeMeta
}

export type ElementName = keyof ElementCollection
