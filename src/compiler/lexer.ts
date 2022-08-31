import { merge } from 'lodash'

import { ASTNode } from './handler'
import { Context } from '../context'
import { Token, CompileOptions } from "./types"


export const TokenExpression = {
	[Token.namespace]: 'namespace <:name> <:statement>',
	[Token.dir]: 'dir <:name> <:statement>',
	[Token.if]: 'if <:condition> <:statement> ( | else <else-statement:statement>)',
	[Token.for]: 'for <:name><space>in<space><l:integer>...<r:integer> <statement>',
	[Token.while]: 'while( | <space>async) <:condition> <:statement>',
	[Token.function]: 'function <:name> <:params> <:statement>'
	// [Token.decorator]: '@<decoratorName:name><params> <statement>',
	// [Token.call_function]: '$<functionName:name><params>',
}

export const LeftBracket = ['(', '[', '{']
export const RightBracket = [')', ']', '}']

interface Eat {
	found: boolean
	result?: number
	match?: { [K: string]: [number, number] }
	children?: { [K: string]: Array<ASTNode> }
}

export class IMCLLexer {
	root: Array<ASTNode>
	ctx: Context

	constructor(
		public source: string,
		public option: CompileOptions,
	) {
		this.ctx = option.context || new Context()
		this.root = this.parse(0, source.length)
	}

	private eat(type: Token, start: number, limit: number): Eat {
		this.ctx.logger.scope('lexer.eat').info(Token[type], start, limit)
		if (type as number === -1) { throw new Error('[Internal] Lexer: Type out of bound.') }
		const notfound = { found: false } as const

		const matchExpression = (expression: string, start: number, limit: number): Eat => {
			this.ctx.logger.scope('lexer.eat').info('matchExpression', expression, start, limit)
			let i = start, j = 0, match = {}, children = {}
			const handlePattern = (pattern: string, next: number): boolean => {
				const patternType = pattern.match(':') ? pattern.split(':', 2)[1] : pattern
				const patternName = pattern.match(':') ? (pattern[0] === ':' ? patternType : pattern.split(':', 2)[0]) : null
				const tried = this.eat(Object.values(Token).indexOf(patternType) as Token, i, limit)
				if (!tried.found) { return false }
				if (tried.match) { match = merge(match, tried.match) }
				if (patternName) {
					match[patternName] = [i, tried.result]
					if (patternType === 'statement') {
						children[patternName] = this.parse(match[patternName][0] + 1, match[patternName][1] - 1)
					}
				}
				i = tried.result
				j = next
				return true
			}
			while (j < expression.length) {
				this.ctx.logger.scope('lexer.eat').info('>>', i, j, [this.source.slice(i, limit), expression.slice(j)])
				if (expression[j] === '<') {
					const matching = expression.indexOf('>', j + 1)
					const pattern = expression.slice(j + 1, matching)
					if (!handlePattern(pattern, matching + 1)) { return notfound }
				} else if (expression[j] === '(') {
					const matching = expression.indexOf(')', j + 1)
					const patterns = expression.slice(j + 1, matching).split(/\s*\|\s*/g)
					let found = false
					for (const pattern of patterns) {
						if (!handlePattern(pattern, matching)) { continue }
						found = true
					}
					if (!found) { return notfound }
				} else if (expression[j] === ' ') {
					i = this.eat(Token.space_internal, i, limit).result, j++
				} else {
					if (this.source[i] !== expression[j]) { return notfound }
					i++, j++
				}
			}
			const returned: Eat = { found: true, result: i }
			if (Object.keys(match).length) { returned.match = match }
			if (Object.keys(children).length) { returned.children = children }
			return returned
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
					i++
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
			case Token.name: {
				if (!this.source[i].match(/[a-zA-Z_]/)) { return notfound }
				i++
				while (i < limit && this.source[i].match(/[a-zA-Z0-9_]/)) { i++ }
				return i === start ? notfound : { found: true, result: i }
			}
			case Token.params: { return matchBracket('(', ')') }
			case Token.condition: { return matchBracket('(', ')') }
			case Token.statement: { return matchBracket('{', '}') }
		}
		throw new Error(`[Internal] Lexer: Unknown type ${Token[type]}`)
	}

	private parse(l: number, r: number): Array<ASTNode> {
		this.ctx.logger.scope('lexer.parse').info(l, r)
		const segment = [] as Array<ASTNode>
		while (l < r) {
			if (this.source[l].match(/\s/)) {
				l = this.eat(Token.space_newline, l, r).result
				if (l >= r) { break }
			}
			let found = false
			for (const key in TokenExpression) {
				const token = (+key) as Token
				const result = this.eat(token, l, r)
				// this.ctx.logger.scope('lexer.parse').debug(l, token, Token[token], result)
				if (result.found) {
					segment.push(new ASTNode(token, [l, result.result], result.match, result.children))
					l = result.result
					found = true
					break
				}
			}
			if (!found) {
				let e = this.source.indexOf('\n', l + 1)
				if (e === -1 || e > r) { e = r }
				segment.push(new ASTNode(Token.command, [l, e]))
				l = e
			}
		}
		return segment
	}
}