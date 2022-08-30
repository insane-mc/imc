import { context } from 'insane-mc'
import path from 'path'

const ctx = context()
	.config({
		name: 'imcl-demo',
		url: 'https://github.com/insane-mc/demo-imc-lang',
		source: __dirname,
		dist: path.join(__dirname, '../../dist/demo-imc-lang'),
	})
	.script('main.imcl')
