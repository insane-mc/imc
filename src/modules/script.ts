import fs from 'fs'
import path from 'path'

import { Context } from '../context'
import { compile, CompileOptions, CompileResult } from '../compiler'
import { Element, ElementMeta } from '../element'
import { Mcfunction, McfunctionSource } from './mcfunction'


export interface ScriptMeta extends ElementMeta {
	data?: CompileResult

	source?: string
	path?: string
	encoding?: BufferEncoding
}


export class Script extends Element {
	data: CompileResult

	functionDeclarer(id: string, anonymous: boolean = true, source: McfunctionSource): Mcfunction {
		let func: Mcfunction
		if (anonymous) {

		} else {
		}
		return func
	}

	constructor(meta: ScriptMeta, ctx: Context) {
		super(meta, ctx)
		this.type = 'script'

		const compileOptions: CompileOptions = {
			context: ctx
		}

		let source: string
		if (meta.path) {
			if (!path.isAbsolute(meta.path)) {
				if (ctx.root.$config.source) {
					meta.path = path.join(ctx.root.$config.source, meta.path)
				} else {
					throw new Error('Script constructor: Using relative path without defined source directory.')
				}
			}
			source = fs.readFileSync(meta.path, { encoding: meta.encoding ? meta.encoding : 'utf8' }).toString()
			compileOptions.path = meta.path
		} else if (meta.source) {
			source = meta.source
		} else {
			this.ctx.logger.scope('script-constructor').warn('Script source is empty.')
			source = '// empty'
		}

		this.data = compile(source, compileOptions)
	}
}
