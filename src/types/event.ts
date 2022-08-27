import { Element, ElementMeta } from '../element'
import { Context, BuildResult } from '../context'


export interface EventCallbackMeta {
	data: string,
	level?: number,
	index?: number,
}
export type EventCallback = string | EventCallbackMeta

export interface EventMeta extends ElementMeta {
	playerTrigger?: string
}

export class Event extends Element {
	callback: Array<EventCallbackMeta>


	concat(another: Event): void {
		this.callback.push.apply(this.callback, another.callback)
	}

	trigger(callback: EventCallback): Event {
		if (typeof callback === 'string') {
			this.callback.push({
				data: callback
			})
		} else {
			this.callback.push(callback)
		}
		return this
	}


	compile(): string {
		for (const i in this.callback) {
			if (!this.callback[i].level) { this.callback[i].level = 0 }
			this.callback[i].index = +i
		}
		this.callback.sort((a: EventCallbackMeta, b: EventCallbackMeta) => {
			if (a.level === b.level) {
				return a.level - b.level
			}
			return a.index - b.index
		})
		return this.callback.map((cb: EventCallbackMeta) => {
			return cb.data
		}).join('\n\n')
	}

	build(): BuildResult {
		return {
			path: `data/${this.namespace}/functions/${this.path}.mcfunction`,
			data: this.compile(),
		}
	}


	constructor(meta: EventMeta, ctx: Context) {
		super(meta, ctx)
		this.callback = []
	}
}



export class InternalEvent {
	load = (ctx: Context) => (new Event({
		name: 'imc:load',
	}, ctx))
	tick = (ctx: Context) => (new Event({
		name: 'imc:tick',
	}, ctx))
}

export type InternalEventName = keyof InternalEvent
export const InternalEventFactory = new InternalEvent()