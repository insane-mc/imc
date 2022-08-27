import { ItemNBT } from '../types'
import { Context } from '../context'
import { Element, ElementMeta } from '../element'


export interface ItemMeta extends ElementMeta {
	data?: ItemNBT

	id: string
	count?: number
	slot?: number
}


export class Item extends Element {
	data: ItemNBT
	count: number
	slot: number

	static toDisplayName(id: string) {
		let vanilla = false
		if (!id.includes(':')) { vanilla = true }
		else if (id.startsWith('minecraft:')) {
			vanilla = true
			id = id.slice(10)
		}
		if (vanilla) {
			return id.split('_').map(word => {
				return word[0].toUpperCase() + word.slice(1).toLowerCase()
			}).join(' ')
		} else {
			return id
		}
	}

	commandGive(target: string = '@s', count?: number) {
		count = count || this.count
		return `give ${target} ${this.id}${JSON.stringify(this.data)} ${count !== 1 ? count : ''}`.trim()
	}

	constructor(meta: ItemMeta, ctx: Context) {
		super(meta, ctx)
		this.type = 'item'

		this.count = meta.count || 1
		if (meta.slot) {
			this.slot = meta.slot
		}
	}
}
