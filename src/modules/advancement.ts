import { Predicate } from './predicate'
import { RawText, NamespaceID } from '../types'
import { Element, ElementMeta } from '../element'
import { Context, BuildResult } from '../context'


export interface AdvancementCondition {
	trigger: string   // https://wiki.biligame.com/mc/%E8%BF%9B%E5%BA%A6/JSON%E6%A0%BC%E5%BC%8F#触发器列表
	conditions?: {
		player?: Array<Predicate>
		[condition: string]: any
	}
}
export interface AdvancementData {
	parent?: NamespaceID
	display?: {
		icon?: {
			item: NamespaceID
			nbt: string
		}
		title?: RawText
		description?: RawText
		frame?: 'task' | 'challenge' | 'goal'
		background?: string
		show_toast?: boolean
		announce_to_chat?: boolean
		hidden?: boolean
	}
	criteria: {
		[name: string]: AdvancementCondition
	}
	requirements?: Array<Array<string>>
	rewards?: {
		function?: NamespaceID
		loot?: Array<NamespaceID>
		recipes?: Array<NamespaceID>
		experience?: number
	}
}

export interface AdvancementMeta extends ElementMeta {
	data?: AdvancementData

	name?: string
	hide?: boolean
}


export class Advancement extends Element {
	name: string
	data: AdvancementData


	build(): BuildResult {
		return {
			path: `data/${this.namespace}/recipes/${this.path}.json`,
			data: this.ctx.stringifyJSON(this.data),
		}
	}


	constructor(meta: AdvancementMeta, ctx?: Context) {
		super(meta, ctx, true)
		this.type = 'advancement'

		if (meta.hide) {
			this.data.display = this.data.display || {}
			this.data.display.show_toast = false
			this.data.display.announce_to_chat = false
			this.data.display.hidden = true
		}
	}
}


if (require.main === module) {
	console.log((new Advancement({
		hide: true,
		data: {
			criteria: {
			}
		},
	})).data)
}