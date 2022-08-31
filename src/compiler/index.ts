export * from './types'
export * from './token'
export * from './source'
export * from './handler'
export * from './lexer'



import { logAST } from './handler'
import { IMCLLexer } from './lexer'
import { CompileOptions, CompileResult } from './types'

export function compile(source: string, options: CompileOptions): CompileResult {
	const lexer = new IMCLLexer(source, options)
	logAST(lexer.root, lexer.source)
	return {}
}