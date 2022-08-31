import { context } from 'insane-mc'
import path from 'path'

const ctx = context()
	.config({
		name: 'imcl-demo',
		url: 'https://github.com/insane-mc/demo-imc-lang',
		source: __dirname,
		dist: path.join(process.env.IMC_TEST_MAP || path.join(__dirname, '../../dist'), 'demo-imc-lang')
	})

ctx.script({path: 'main.imcl'})
ctx.root.build()