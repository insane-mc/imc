import { Token } from './types'
import { Logger } from '../logger'

export class ASTNode {
	constructor(
		public token: Token,
		public range: [number, number],
		public match?: { [K: string]: [number, number] },
		public children?: { [K: string]: Array<ASTNode> },
	) { }
}

export function logAST(segment: Array<ASTNode>, source: string) {
	const logger = new Logger('AST')
	const dfs = (segment: Array<ASTNode>, prefix = ''): void => {
		for (const node of segment) {
			let out = JSON.stringify(node.match || {}).slice(1, -1)
			if (node.token === Token.command) { out = source.slice(node.range[0], node.range[1]) }
			logger.debug(`${prefix}${Token[node.token]} [${node.range[0]}:${node.range[1]}] {${out}}`)
			if (node.children) {
				for (const name in node.children) {
					logger.debug(`${prefix}  - ${name}:`)
					dfs(node.children[name], prefix + '     ')
				}
			}
		}
	}
	dfs(segment)
}