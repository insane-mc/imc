import { ContextRoot, context, stringifyRawText, generateRecipeBook } from 'insane-mc'
import { merge } from 'lodash'
import path from 'path'

import pluginRecipe from './recipe'

const ctx = context().namespace('uhc')
ctx.root
	.config('name', 'hypixel-uhc')
	.config('url', 'https://github.com/insane-mc/datapack-hypixel-uhc')
	.config('source', __dirname)
	.config('dist', path.join(__dirname, '../../dist/datapack-hypixel-uhc'))
	.config('operation.build.copyReadme', true)
	.plugin(pluginRecipe)

const recipeBook = ctx.item(merge(generateRecipeBook(Object.values(ctx.root.$data?.recipe || [])), {
	data: {
		title: 'UHC Recipe Book',
		author: 'memset0 & IMC Dev.',
	}
}))
const giveRecipeBook = ctx.event({
	name: 'give_recipe_book',
}).trigger(recipeBook.commandGive('@s'))

ctx.on('load', 'tellraw @p ' + stringifyRawText([
	{ text: 'Datapack ' },
	{ text: 'hypixel-uhc', bold: true, color: 'blue' },
	{ text: ' is loaded.\n' },
	{ text: 'Click ' },
	{
		text: 'here', underlined: true, color: 'green',
		clickEvent: {
			action: 'run_command',
			value: `/function ${giveRecipeBook.id}`,
		}
	},
	{ text: ' or use command ' },
	{
		text: `/function ${giveRecipeBook.id}`, color: 'gold',
		clickEvent: {
			action: 'copy_to_clipboard',
			value: `/function ${giveRecipeBook.id}`,
		}
	},
	{ text: ' to get the recipe book.\n' }
]))

ctx.root.build()