import fs from 'fs'
import path from 'path'
import { Stream } from 'stream'
import { uniq, merge, cloneDeep } from 'lodash'

import { Logger } from './logger'
import { NamespaceID } from './types'
import { EventCallback, InternalEventName, InternalEventFactory } from './modules/event'
import { ElementMeta, ElementCreater, ElementName, ElementCollection } from './element'

import { Advancement, AdvancementMeta } from './modules/advancement'
import { Event, EventMeta } from './modules/event'
import { Item, ItemMeta } from './modules/item'
import { Recipe, RecipeMeta } from './modules/recipe'


export interface ContextPromise {
	resolve: (ctx: Context) => {}
	reject: (err: Error) => {}
}

export interface ContextMethodIdOptions {
	flat?: boolean
	spec?: string
}

export interface BuildResult {
	path: string
	data: string | Stream
}


export interface Config {
	env: string,

	name: string,
	url: string,
	description: string,

	source: string,
	dist: string,
	// static: string | Array<string>,

	packMeta: {
		pack_format: number
		filter: any
		comment: { [K: string]: any }
	}

	operation: {
		build: {
			copyReadme: boolean
		}
	}
}


export class Context {
	logger: Logger

	$config?: Partial<Config>
	$pool?: Array<NamespaceID>
	$promises?: Array<ContextPromise>
	$event: {
		[K in InternalEventName]?: Event
	}
	$data?: {
		[elementName in ElementName]?: {
			[K: string]: ElementCollection[elementName]
		}
	}

	$namespace: Array<string>
	$dir: Array<string>
	$declaration: {
		// require: Array<string>
		macro: { [K: string]: any }
		data: { [K: string]: any }
	}



	// Utils

	stringifyJSON(data) {
		if (this.root.$config.env === 'PRODUCEMENT') {
			return JSON.stringify(data)
		} else {
			return JSON.stringify(data, null, 2)
		}
	}



	// Basic Methods

	isRoot: boolean
	root: Context

	clone(): Context {
		const cloned = new Context(false)
		cloned.root = this.root
		cloned.isRoot = false
		cloned.$declaration = cloneDeep(this.$declaration)
		cloned.$namespace = cloneDeep(this.$namespace)
		cloned.$dir = cloneDeep(this.$dir)
		return cloned
	}

	config(path: string, value: any): void {
		if (!this.isRoot) { throw new Error('method `config` could only be called at root node') }
		const keyList = path.split('.')
		let pointer: any = this.$config as any
		for (let i = 0; i + 1 < keyList.length; i++) {
			if (!(keyList[i] in pointer)) {
				pointer[keyList[i]] = {}
			}
			pointer = pointer[keyList[i]]
		}
		pointer[keyList[keyList.length - 1]] = value
	}



	// Exposed Methods

	// require(declaration: string, additional?: string): Promise<Context> {
	// 	if (additional) {
	// 		// treat `declaration` as `type`, `additional` as `name`
	// 		declaration = declaration + '::' + additional
	// 	}
	// 	const cloned = this.clone()
	// 	cloned.$declaration.require.push(declaration)
	// 	return cloned
	// }

	id(name: string, options?: ContextMethodIdOptions): NamespaceID {
		options = options || {}

		let namespace: Array<string>
		let path: Array<string>

		if (name.includes(':')) {
			const temp = name.split(':', 2)
			namespace = temp[0].split('.')
			path = temp[1].split('/')
		} else {
			namespace = cloneDeep(this.$namespace)
			if (!namespace.length) {
				namespace.push('imc')
			}
			if (name.startsWith('/')) {
				path = name.split('/').slice(1)
			} else {
				path = cloneDeep(this.$dir)
				if (options.spec) {
					path.push(`__imc_${options.spec}__`)
				}
				path.push.apply(path, name.split('/'))
			}
		}

		// this.logger.scope('id').debug(name, namespace, path, options)
		return namespace.join('.') + ':' + path.join(options.flat ? '___' : '/')
	}

	namespace(value: string | Array<string>, options?: any): Context {
		options = merge({ replace: false }, options || {})
		if (typeof value === 'string') { value = value.split('.') as Array<string> }
		const cloned = this.clone()
		cloned.$namespace = [...(options.replace ? [] : this.$namespace), ...value]
		cloned.logger = new Logger(cloned.$namespace, cloned.$dir)
		return cloned
	}

	dir(value: string | Array<string>, options?: any): Context {
		options = merge({ replace: false }, options || {})
		if (typeof value === 'string') { value = value.split('/') as Array<string> }
		const cloned = this.clone()
		cloned.$dir = [...(options.replace ? [] : this.$namespace), ...value]
		cloned.logger = new Logger(cloned.$namespace, cloned.$dir)
		return cloned
	}

	macro(name: string, value: string) {
		const cloned = this.clone()
		cloned.$declaration.macro[name] = value
		return cloned
	}

	// use(another: Context): void {
	// }

	get(type: string, name?: string): any {
		if (!name) {
			[type, name] = type.split('::', 1)
		}
		if (type === 'macro') {
			return this.$declaration.macro[name]
		}
		return this.root.$data[type]?.[name] || null
	}

	private declare<T extends ElementCollection[ElementName], M extends ElementMeta>(
		type: ElementName,
		meta: string | M,
		creater: ElementCreater<T>
	): T {
		if (typeof meta === 'string') { return this.get(type, meta) }
		const element = new creater(meta, this)
		if (!this.root.$data[type]) { this.root.$data[type] = {} }
		this.root.$data[type][element.id] = element as T
		this.root.$pool.push(`${type}::${element.id}`)
		return element
	}



	// Element Operations

	recipe(meta: string | RecipeMeta) { return this.declare('recipe', meta, Recipe) }
	event(meta: string | EventMeta) { return this.declare('event', meta, Event) }
	item(meta: string | ItemMeta) { return this.declare('item', meta, Item) }
	advancement(meta: string | AdvancementMeta) { return this.declare('advancement', meta, Advancement) }



	// Event Operations

	private onInternal(eventName: InternalEventName, callback?: EventCallback): Event | Context {
		if (!this.isRoot) { return this.root.on(eventName, callback) }
		if (!(eventName in this.$event)) {
			this.$event[eventName] = InternalEventFactory[eventName](this)
			if (!this.root.$data.event) { this.root.$data.event = {} }
			this.$data.event[this.$event[eventName].id] = this.$event[eventName]
		}
		if (callback) {
			this.$event[eventName].trigger(callback)
			return this
		} else {
			return this.$event[eventName]
		}
	}

	on(eventName: string, callback?: EventCallback): Event | Context {
		// this.logger.debug(eventName, callback, (eventName in Object.keys(InternalEventFactory)))
		if (Object.keys(InternalEventFactory).includes(eventName)) {
			return this.onInternal(eventName as InternalEventName, callback)
		}
		return this
	}



	// Build Process

	async build(): Promise<void> {
		if (!this.isRoot) { throw new Error('method `build` could only be called at root node') }
		if (!this.$config.dist) { throw new Error('config `dist` is required()') }

		const logger = this.logger.scope('build')
		logger.info('building to', this.$config.dist)

		const copyFile = async (source: string, target: string): Promise<void> => {
			const dir = path.join(this.$config.dist, target)
			const stream = await fs.promises.readFile(source)
			await fs.promises.mkdir(path.dirname(dir), { recursive: true })
			await fs.promises.writeFile(dir, stream)
		}

		const writeFile = async (dir: string, data: string | Stream) => {
			dir = path.join(this.$config.dist, dir)
			await fs.promises.mkdir(path.dirname(dir), { recursive: true })
			await fs.promises.writeFile(dir, data)
		}

		const packMeta: any = {}
		packMeta.__info__ = 'This datapack is generated by Insane Minecraft Compiler. Visit https://github.com/insane-mc/imc for more information.'
		if (this.$config.name) { packMeta.__name__ = this.$config.name }
		if (this.$config.url) { packMeta.__url__ = this.$config.url }
		if (this.$config.packMeta?.comment) {
			for (const key in this.$config.packMeta?.comment) {
				packMeta[`__${key}__`] = this.$config.packMeta?.comment[key]
			}
		}
		packMeta.pack = {
			pack_format: this.$config.packMeta?.pack_format || 6,
			description: this.$config.description || 'A datapack generated by Insane Minecraft Compiler.',
		}
		if (this.$config.packMeta?.filter) { packMeta.filter = this.$config.packMeta?.filter }

		// await fs.promises.rm(this.$config.dist, { recursive: true, force: true })
		const promises = []
		promises.push(writeFile('pack.mcmeta', this.stringifyJSON(packMeta)))
		promises.push(writeFile('data/minecraft/tags/functions/tick.json', this.stringifyJSON({
			values: ["imc:tick"]
		})))
		promises.push(writeFile('data/minecraft/tags/functions/load.json', this.stringifyJSON({
			values: ["imc:load"]
		})))
		for (const type in this.$data) {
			for (const id in this.$data[type]) {
				const element = this.$data[type][id]
				if (!element.build) { continue }
				const result: BuildResult = element.build()
				// this.logger.scope('build').info(id, result.path)
				promises.push(writeFile(result.path, result.data))
			}
		}

		if (this.$config.operation?.build) {
			if (this.$config.operation.build.copyReadme) {
				promises.push(copyFile(path.join(this.$config.source, 'README.md'), 'README.md'))
			}
		}

		await Promise.all(promises)
		logger.info('done')

		// const queue: Array<Context> = []
		// const rest: Array<[number, Context]> = []
		// const satisfy: { [R: string]: Array<number> } = {}

		// for (const subctx of this.$queue) {
		// 	const requirements = uniq(subctx.$declaration.require)
		// 	if (requirements.length) {
		// 		for (const requirement of requirements) {
		// 			satisfy[requirement] = satisfy[requirement] || []
		// 			satisfy[requirement].push(rest.length)
		// 		}
		// 		rest.push([requirements.length, subctx])
		// 	} else {
		// 		queue.push(subctx)
		// 	}
		// }

		// let pointer = 0
		// let tracker = 0
		// while (pointer < queue.length) {
		// 	pointer += 1
		// 	while (tracker < this.$pool.length) {
		// 		if (this.$pool[tracker] in satisfy) {
		// 			for (const task of satisfy[this.$pool[tracker]]) {
		// 				rest[task][0] -= 1
		// 				if (rest[task][0] === 0) {
		// 					queue.push(rest[task][1])
		// 				}
		// 			}
		// 		}
		// 		tracker += 1
		// 	}
		// }

		// if (queue.length !== this.$queue.length) {
		// 	throw new Error('Build failed: some requirement could not be satisfied.')
		// }
	}


	constructor(isRoot = true) {
		if (isRoot) {
			this.isRoot = true
			this.root = this

			this.$config = {}
			this.$pool = []
			this.$data = {}
			this.$event = {}

			this.$namespace = []
			this.$dir = []
			this.$declaration = {
				macro: {},
				data: {},
			}

		} else {
			this.isRoot = false
		}

		this.logger = new Logger(this.$namespace, this.$dir)
	}
}
