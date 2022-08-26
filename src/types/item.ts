import { Element, ElementMeta } from '../element'
import { Context } from '../context'


export interface ItemData {

}


export interface ItemMeta extends ElementMeta {
	data: ItemData
}


export class Item extends Element {
	command = {
		give() {

		}
	}

	constructor(meta: ItemMeta, ctx: Context) {
		super(meta, ctx)
		this.type = 'item'
	}
}