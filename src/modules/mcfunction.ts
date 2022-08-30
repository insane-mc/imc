import { Context } from '../context'
import { IMCLSource } from '../compiler'
import { Element, ElementMeta } from '../element'

export interface McfunctionSource {
	source: IMCLSource
	start: string
	end: string
}

export interface McfunctionComment {
	author?: string
	license?: string
	copyright?: string
	header?: string
	footer?: string

	// hide in PRODUCTION
	source?: McfunctionSource
	headerDev?: string
	footerDev?: string
}

export interface McfunctionData {
	comments: McfunctionComment
}

export interface McfunctionMeta extends ElementMeta {
	data?: McfunctionData
}


export class Mcfunction extends Element {
	data: McfunctionData



	constructor(meta: McfunctionMeta, ctx: Context) {
		super(meta, ctx)
		this.type = 'mcfunction'

	}
}