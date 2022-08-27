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
	count: number
	slot: number

	commandGive(target) {
		return `give ${target} ${this.id}${JSON.stringify(this.data)} ${this.count}`
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