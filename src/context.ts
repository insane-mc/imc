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


export type ContextPromiseResolve = (ctx: Context | PromiseLike<Context>) => void
export type ContextPromiseReject = (err: Error) => void
export interface ContextPromise {
	resolve: ContextPromiseResolve
	reject: ContextPromiseReject
	current: Context,
	requirement: Array<string>
}

export interface ContextPreset {
	macro: { [K: string]: any }
	data: { [K: string]: any }
}

export interface ContextMethodIdOptions {
	flat?: boolean
	spec?: string
}

export interface ContextBuildResult {
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
	isRoot: boolean
	root: ContextRoot

	$namespace: Array<string>
	$dir: Array<string>
	$preset: ContextPreset


	// utils

	stringifyJSON(data: any) {
		if (this.root.$config.env === 'PRODUCEMENT') {
			return JSON.stringify(data)
		} else {
			return JSON.stringify(data, null, 2)
		}
	}

	clone(): Context {
		return new Context(
			this.root,
			cloneDeep(this.$namespace),
			cloneDeep(this.$dir),
			cloneDeep(this.$preset)
		)
	}

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


	// methods

	require(requirement: string | Array<string>): Promise<Context> {
		if (typeof requirement === 'string') { requirement = [requirement] }
		return new Promise((resolve: ContextPromiseResolve, reject: ContextPromiseReject) => {
			this.root.$promises.push({
				resolve,
				reject,
				current: this.clone(),
				requirement: requirement as Array<string>,
			})
		})
	}

	namespace(value: string | Array<string>, options?: any): Context {
		options = merge({ replace: false }, options || {})
		if (typeof value === 'string') { value = value.split('.') as Array<string> }
		return new Context(
			this.root,
			[...(options.replace ? [] : this.$namespace), ...value],
			cloneDeep(this.$dir),
			cloneDeep(this.$preset)
		)
	}

	dir(value: string | Array<string>, options?: any): Context {
		options = merge({ replace: false }, options || {})
		if (typeof value === 'string') { value = value.split('/') as Array<string> }
		return new Context(
			this.root,
			cloneDeep(this.$namespace),
			[...(options.replace ? [] : this.$dir), ...value],
			cloneDeep(this.$preset)
		)
	}

	macro(name: string, value: string) {
		const cloned = this.clone()
		cloned.$preset.macro[name] = value
		return cloned
	}


	// declare

	get(type: string, name?: string): any {
		if (!name) {
			[type, name] = type.split('::', 1)
		}
		if (type === 'macro') {
			return this.$preset.macro[name]
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

	recipe(meta: string | RecipeMeta) { return this.declare('recipe', meta, Recipe) }
	event(meta: string | EventMeta) { return this.declare('event', meta, Event) }
	item(meta: string | ItemMeta) { return this.declare('item', meta, Item) }
	advancement(meta: string | AdvancementMeta) { return this.declare('advancement', meta, Advancement) }


	// event

	private onInternalEvent(eventName: InternalEventName, callback?: EventCallback): Event | Context {
		if (!(eventName in this.root.$event)) {
			this.root.$event[eventName] = InternalEventFactory[eventName](this.root)
			if (!this.root.$data.event) { this.root.$data.event = {} }
			this.root.$data.event[this.root.$event[eventName].id] = this.root.$event[eventName]
		}
		if (callback) {
			this.root.$event[eventName].trigger(callback)
			return this
		} else {
			return this.root.$event[eventName]
		}
	}

	on(eventName: string, callback?: EventCallback): Event | Context {
		// this.logger.debug(eventName, callback, (eventName in Object.keys(InternalEventFactory)))
		if (Object.keys(InternalEventFactory).includes(eventName)) {
			return this.onInternalEvent(eventName as InternalEventName, callback)
		}
		return this
	}

	constructor(root?: ContextRoot, namespace?: Array<string>, dir?: Array<string>, preset?: ContextPreset) {
		this.isRoot = false
		if (root) { this.root = root }
		if (namespace) { this.$namespace = namespace }
		if (dir) { this.$dir = dir }
		if (preset) { this.$preset = preset }
		this.logger = new Logger(this.$namespace, this.$dir)
	}
}



export class ContextRoot extends Context {
	$pool: Array<NamespaceID>
	$promises: Array<ContextPromise>
	$config: Partial<Config>
	$event: {
		[K in InternalEventName]?: Event
	}
	$data: {
		[elementName in ElementName]?: {
			[K: string]: ElementCollection[elementName]
		}
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

	plugin(rhs: ContextRoot): ContextRoot {
		this.$pool.push.apply(this.$pool, rhs.$pool)
		this.$promises.push.apply(this.$promises, rhs.$promises)
		this.$config = merge(this.$config, rhs.$config)
		for (const eventName in rhs.$event) {
			if (eventName in this.$event) {
				this.$event[eventName].merge(rhs.$event[eventName])
			} else {
				this.$event[eventName] = rhs.$event[eventName]
			}
		}
		for (const elementName in rhs.$data) {
			if (elementName in this.$data) {
				for (const elementId in rhs.$data[elementName]) {
					if (elementId in this.$data[elementName]) {
						this.logger.scope('plugin').warn('id conflicted:', elementId)
					} else {
						this.$data[elementName][elementId] = rhs.$data[elementName][elementId]
					}
				}
			} else {
				this.$data[elementName] = rhs.$data[elementName]
			}
		}
		return this
	}

	async build(): Promise<void> {
		if (!this.$config.dist) { throw new Error('config `dist` is required()') }
		return await buildContext(this)
	}


	constructor() {
		super()
		this.isRoot = true
		this.root = this
		this.$namespace = []
		this.$dir = []
		this.$preset = {
			macro: {},
			data: {},
		}

		this.$pool = []
		this.$promises = []
		this.$config = {}
		this.$event = {}
		this.$data = {}
	}
}



export async function buildContext(ctx: ContextRoot): Promise<void> {
	const logger = ctx.logger.scope('build')
	logger.info('building to', ctx.$config.dist)

	const queue: Array<ContextPromise> = []
	const rest: Array<[number, ContextPromise]> = []
	const satisfy: { [R: string]: Array<number> } = {}

	let promiseTracker = 0
	let dataTracker = 0
	let pointer = 0

	while (promiseTracker < ctx.$promises.length) {
		const promise = ctx.$promises[promiseTracker++]
		const requirements = uniq(promise.requirement)
		if (requirements.length) {
			for (const requirement of requirements) {
				satisfy[requirement] = satisfy[requirement] || []
				satisfy[requirement].push(rest.length)
			}
			rest.push([requirements.length, promise])
		} else {
			queue.push(promise)
		}

		while (pointer < queue.length) {
			const promise = queue[pointer++]
			promise.resolve(promise.current)

			while (dataTracker < ctx.$pool.length) {
				const name = ctx.$pool[dataTracker++]

				if (name in satisfy) {
					for (const task of satisfy[name]) {
						rest[task][0] -= 1
						if (rest[task][0] === 0) {
							queue.push(rest[task][1])
						}
					}
				}
			}
		}
	}

	for (const i in rest) {
		if (rest[i][0] > 0) {
			logger.error(`task #${i} would not be satisfied, last ${rest[i][0]}:`, rest[i][1])
			throw new Error('Build failed: some requirements could not be satisfied.')
		}
	}

	const copyFile = async (source: string, target: string): Promise<void> => {
		const dir = path.join(ctx.$config.dist, target)
		const stream = await fs.promises.readFile(source)
		await fs.promises.mkdir(path.dirname(dir), { recursive: true })
		await fs.promises.writeFile(dir, stream)
	}

	const writeFile = async (dir: string, data: string | Stream) => {
		dir = path.join(ctx.$config.dist, dir)
		await fs.promises.mkdir(path.dirname(dir), { recursive: true })
		await fs.promises.writeFile(dir, data)
	}

	const packMeta: any = {}
	packMeta.__info__ = 'This datapack is generated by Insane Minecraft Compiler. Visit https://github.com/insane-mc/imc for more information.'
	if (ctx.$config.name) { packMeta.__name__ = ctx.$config.name }
	if (ctx.$config.url) { packMeta.__url__ = ctx.$config.url }
	if (ctx.$config.packMeta?.comment) {
		for (const key in ctx.$config.packMeta?.comment) {
			packMeta[`__${key}__`] = ctx.$config.packMeta?.comment[key]
		}
	}
	packMeta.pack = {
		pack_format: ctx.$config.packMeta?.pack_format || 6,
		description: ctx.$config.description || 'A datapack generated by Insane Minecraft Compiler.',
	}
	if (ctx.$config.packMeta?.filter) { packMeta.filter = ctx.$config.packMeta?.filter }

	// await fs.promises.rm(ctx.$config.dist, { recursive: true, force: true })
	const promises = []
	promises.push(writeFile('pack.mcmeta', ctx.stringifyJSON(packMeta)))
	promises.push(writeFile('data/minecraft/tags/functions/tick.json', ctx.stringifyJSON({
		values: ["imc:tick"]
	})))
	promises.push(writeFile('data/minecraft/tags/functions/load.json', ctx.stringifyJSON({
		values: ["imc:load"]
	})))
	for (const type in ctx.$data) {
		for (const id in ctx.$data[type]) {
			const element = ctx.$data[type][id]
			if (!element.build) { continue }
			const result: ContextBuildResult = element.build()
			// ctx.logger.scope('build').info(id, result.path)
			promises.push(writeFile(result.path, result.data))
		}
	}

	if (ctx.$config.operation?.build) {
		if (ctx.$config.operation.build.copyReadme) {
			promises.push(copyFile(path.join(ctx.$config.source, 'README.md'), 'README.md'))
		}
	}

	await Promise.all(promises)
	logger.info('done')
}



export function context(): ContextRoot {
	return new ContextRoot()
}