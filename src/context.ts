import fs from 'fs'
import path from 'path'
import { Stream } from 'stream'
import { uniq, merge, cloneDeep } from 'lodash'

import { Logger } from './logger'
import { NamespaceID } from './types/interface'
import { ElementMeta, ElementCreater, ElementName, ElementCollection } from './element'

import { Advancement, AdvancementMeta } from './types/advancement'
import { Item, ItemMeta } from './types/item'
import { Recipe, RecipeMeta } from './types/recipe'


export interface ContextPromise {
	resolve: (ctx: Context) => {}
	reject: (err: Error) => {}
}

export interface ContextMethodIdOptions {
	flat?: boolean
	spec?: string
}


export class Context {
	logger: Logger

	$config?: any
	$pool?: Array<NamespaceID>
	$promises?: Array<ContextPromise>
	$data?: {
		[elementName in ElementName]?: {
			[key: string]: ElementCollection[elementName]
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
		let pointer = this.$config
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
		options = merge({ flat: false, spec: '' }, options || {})

		const namespace = cloneDeep(this.$namespace)
		if (!namespace.length) {
			namespace.push('imc')
		}

		const dir = cloneDeep(this.$dir)
		if (options.spec) {
			dir.push(`__imc_${options.spec}__`)
		}
		dir.push.apply(dir, name.split('/'))

		this.logger.scope('id').info(name, dir)
		return namespace.join('.') + ':' + dir.join(options.flat ? '/' : '___')
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
	item(meta: string | ItemMeta) { return this.declare('recipe', meta, Item) }
	advancement(meta: string | AdvancementMeta) { return this.declare('advancement', meta, Advancement) }


	// Build Process

	async build(): Promise<void> {
		if (!this.isRoot) { throw new Error('method `build` could only be called at root node') }
		if (!this.$config.dist) { throw new Error('config `dist` is required()') }

		const logger = this.logger.scope('build')

		const writeFile = async (dir: string, data: string | Stream) => {
			dir = path.join(this.$config.dist, dir)
			await fs.promises.mkdir(path.dirname(dir), { recursive: true })
			await fs.promises.writeFile(dir, data)
		}

		// await fs.promises.rm(this.$config.dist, { recursive: true, force: true })
		const promises = []
		promises.push(writeFile('pack.mcmeta', this.stringifyJSON({
			pack: {
				pack_format: this.$config.packMeta?.pack_format || 6,
				description: this.$config.packMeta?.description || 'Generated by Insane Minecraft Compiler.',
			},
			filter: this.$config.packMeta?.filter || {},
		})))
		for (const type in this.$data) {
			for (const id in this.$data[type]) {
				const element = this.$data[type][id]
				if (!element.compile) { continue }
				const result = element.compile()
				logger.info(id, result.dir)
				promises.push(writeFile(result.dir, result.data))
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
