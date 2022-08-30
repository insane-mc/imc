import { merge } from 'lodash'

import { ASTNode, CompileOptions } from "./types"


export enum Token {
	space,
	space_newline,
	space_internal,
	number,
	integer,
	variable,
	condition,
	statement,

	// internal
	namespace,
	dir,
	if,
	for,
	while,
}

export const TokenExpression = {
	[Token.namespace]: 'namespace <:statement>',
	[Token.dir]: 'dir <:statement>',
	[Token.if]: 'if <:condition> <:statement> ( | else <else-statement:statement>)',
	[Token.for]: 'for <:variable><l:space>in<r:space><integer>...<integer> <statement>',
	[Token.while]: 'while( | <space>async) <condition> <statement>',
}

export const LeftBracket = ['(', '[', '{']
export const RightBracket = [')', ']', '}']

interface Eat {
	found: boolean
	result?: number
	data?: { [K: string]: [number, number] }
}

export class IMCLLexer {
	source: string

	private eat(type: Token, start: number, limit: number): Eat {
		if (type as number === -1) { throw new Error('[Internal] Lexer: Type out of bound.') }
		const notfound = { found: false } as const

		const parsePattern = (pattern: string): [string, string] => {
			const patternType = pattern.match(':') ? pattern.split(':', 2)[1] : pattern
			const patternName = pattern.match(':') ? (pattern[0] === ':' ? patternType : pattern.split(':', 2)[0]) : null
			return [patternType, patternName]
		}
		const matchExpression = (expression: string, start: number, limit: number): Eat => {
			let i = start, j = 0, data = {}
			while (j < expression.length) {
				if (expression[j] === '<') {
					const pattern = expression.slice(j + 1, expression.indexOf('>', j + 1))
					const [patternType, patternName] = parsePattern(pattern)
					const tried = this.eat(Object.values(Token).indexOf(patternType) as Token, i, limit)
					if (!tried.found) { return notfound }
					data = merge(data, tried.data, { [patternName]: [i, tried.result] })
					i = tried.result
					j = expression.indexOf('>', j + 1) + 1
				} else if (expression[j] === '(') {
					const patterns = expression.slice(j + 1, expression.indexOf(')', j + 1)).split(/\s*\|\s*/g)
					let found = false
					for (const pattern of patterns) {
						const [patternType, patternName] = parsePattern(pattern)
						const tried = this.eat(Object.values(Token).indexOf(patternType) as Token, i, limit)
						if (!tried.found) { continue }
						found = true
						data = merge(data, tried.data, { [patternName]: [i, tried.result] })
						i = tried.result
						j = expression.indexOf(')', j + 1) + 1
					}
					if (!found) { return notfound }
				} else if (expression[j] === ' ') {
					i = this.eat(Token.space_internal, i, limit).result, j++
				} else {
					if (this.source[i] !== expression[j]) { return notfound }
					i++, j++
				}
			}
			return { found: true, result: i, data: data }
		}
		if (type in TokenExpression) {
			return matchExpression(TokenExpression[type], start, limit)
		}

		let i = start
		const matchBracket = (L: string, R: string): Eat => {
			if (this.source[i] === L) {
				let stack = []
				i++
				while (i < limit) {
					if (LeftBracket.includes(this.source[i])) {
						stack.push(RightBracket[LeftBracket.indexOf(this.source[i])])
					} else if (RightBracket.includes(this.source[i])) {
						if (stack.length) {
							if (this.source[i] === stack[stack.length - 1]) {
								stack.pop()
							} else {
								return notfound
							}
						} else if (this.source[i] === R) {
							return { found: true, result: i + 1 }
						} else {
							return notfound
						}
					}
					i++
				}
			}
			return notfound
		}
		switch (type) {
			case Token.space: {
				while (i < limit && this.source[i] !== '\n' && this.source[i] !== '\r' && this.source[i].match(/\s/)) { i++ }
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.space_newline: {
				while (i < limit && this.source[i].match(/\s/)) { i++ }
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.space_internal: {
				let newline = false
				while (i < limit && this.source[i].match(/\s/)) {
					if (this.source[i] === '\r' || this.source[i] === '\n') {
						if (newline) { return notfound }
						newline = true
						if (this.source[i] === '\r' && i + 1 < limit && this.source[i + 1] === '\n') {
							i += 2
						} else {
							i++
						}
					}
				}
				return { found: true, result: i }
			}
			case Token.number: {
				let pointed = false
				if (this.source[i] === '+' || this.source[i] === '-') {
					if (i + 1 >= limit || !this.source[i + 1].match(/[0-9.]/)) { return notfound }
					i++
				}
				while (i < limit && this.source[i].match(/[0-9.]/)) {
					if (this.source[i] === '.') {
						if (pointed) { return notfound }
						pointed = true
					}
					i++
				}
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.integer: {
				if (this.source[i] === '+' || this.source[i] === '-') {
					if (i + 1 >= limit || !this.source[i + 1].match(/[0-9]/)) { return notfound }
					i++
				}
				while (i < limit && this.source[i].match(/[0-9]/)) { i++ }
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.variable: {
				if (!this.source[i].match(/[a-zA-Z_]/)) { return notfound }
				i++
				while (i < limit && this.source[i].match(/[a-zA-Z0-9_]/)) { i++ }
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.condition: {
				return matchBracket('(', ')')
			}
			case Token.statement: {
				return matchBracket('{', '}')
			}
		}
		throw new Error(`[Internal] Lexer: Unknown type ${Token[type]}`)
	}

	private parse(l: number, r: number) {
		while (l < r) {
			if (this.source[l].match(/\s/)) {
				l = this.eat(Token.space_newline, l, r)[1]
				//TODO
			}
		}
	}

	constructor(source: string, option: CompileOptions) {
		this.parse(0, source.length)
	}
}