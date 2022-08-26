import chalk from 'chalk'
import dayjs from 'dayjs'

const colors = [chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan]
const brightColors = [chalk.redBright, chalk.greenBright, chalk.yellowBright, chalk.blueBright, chalk.magentaBright, chalk.cyanBright]

function stringHash(str) {
	let hash = 5381, i = str.length
	while (i) { hash = (hash * 33) ^ str.charCodeAt(--i) }
	return hash >>> 0
}

export class Logger {
	logger = {
		debug: console.debug,
		info: console.info,
		warn: console.warn,
		error: console.error,
	}

	$namespace: string
	$dir: string
	$scoped: string

	hashPath: number
	hashScoped: number

	render(...argv): any[] {
		if (this.$scoped) {
			argv.unshift(brightColors[this.hashScoped % brightColors.length](`(${this.$scoped})`))
		}
		if (this.$namespace && this.$dir) {
			argv.unshift(colors[this.hashPath % colors.length](`(${this.$namespace}:${this.$dir})`))
		}
		argv.unshift(chalk.grey(`[${dayjs().format('YY-MM-DD HH:mm:ss')}]`))
		return argv
	}

	debug(...argv) { this.logger.debug(...this.render(...argv)) }
	info(...argv) { this.logger.info(...this.render(...argv)) }
	warn(...argv) { this.logger.warn(...this.render(...argv)) }
	error(...argv) { this.logger.error(...this.render(...argv)) }


	scope(value: string): Logger {
		return new Logger(this.$namespace, this.$dir, value)
	}


	constructor(
		namespace?: string | Array<string>,
		dir?: string | Array<string>,
		scoped?: string
	) {
		if (namespace) {
			this.$namespace = typeof namespace === 'string' ? namespace : namespace.join('.')
		}
		if (dir) {
			this.$dir = typeof dir === 'string' ? dir : dir.join('/')
		}
		if (namespace && dir) {
			this.hashPath = stringHash(`${this.$namespace}:${this.$dir}`)
		}

		if (scoped) {
			this.$scoped = scoped
			this.hashScoped = stringHash(this.$scoped)
		}
	}
}	