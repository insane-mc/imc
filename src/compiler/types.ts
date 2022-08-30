import { Context } from '../context'
import { IMCLToken } from './token'


export interface CompileOptions {
	context?: Context
	path?: string
}

export interface CompileResult {

}



export type tokenName =
	'if' |
	'for' |
	'while' |
	'def' |
	'macro' |
	'function' |
	'namespace' |
	'dir'

export interface ASTNode {
	type: string
	context: Context
	token: IMCLToken
	next?: ASTNode
	children?: Array<ASTNode>
}