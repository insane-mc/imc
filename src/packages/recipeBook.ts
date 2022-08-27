import { cloneDeep } from 'lodash'
import { arabToRoman } from 'roman-numbers'

import { Recipe } from '../modules/recipe'
import { Item, ItemMeta } from '../modules/item'
import { MinecraftColor, RawTextObject, stringifyRawText } from '../types/rawtext'


const PatternColor: Array<MinecraftColor> = [
	'red',
	'blue',
	'light_purple',
	'dark_aqua',
	'gold',
	'green',
	'dark_red',
	'dark_blue',
	'dark_purple',
]

function repeat(count: number, char: string = ' ') {
	let result = ''
	while (count--) { result += char }
	return result
}

function rawtext(text: string): RawTextObject { return { text } }

function center(rawtext: RawTextObject | Array<RawTextObject>, limit = 29): Array<RawTextObject> {
	rawtext = [rawtext].flat()
	const len = stringifyRawText(rawtext, true).length
	rawtext.unshift({ text: repeat(Math.max(0, (limit - len) >> 1)) })
	return rawtext
}


export function generateRecipeBook(recipes: Array<Recipe>, title?: string): ItemMeta {
	title = title || 'Recipe Book'

	const data = recipes.map((recipe, index) => ({
		recipe,
		index,
		page: [] as Array<RawTextObject | Array<RawTextObject>>,
	}))
	const pages = []

	for (let i = 0; i * 10 < data.length; i++) {
		pages.push([{ text: '' }])
		pages[i].push(center([
			{ text: title, bold: true },
			{ text: ` (Page ${i + 1})\n\n`, color: 'dark_gray' }
		]))
	}

	for (const e of data) {
		e.page.push({ text: '' })
		e.page.push({
			text: '◀ ',
			color: 'dark_green',
			bold: true,
			clickEvent: {
				action: 'change_page',
				value: String(Math.floor(e.index / 10) + 1),
			}
		})
		e.page.push({ text: `#${e.index + 1}. `, color: 'dark_gray' })
		e.page.push({
			text: e.recipe.displayName + '\n',
			bold: true,
			underlined: true,
		})

		let lineCount = Object.keys(e.recipe.data.key).length

		if (e.recipe.result) {
			e.page.push({ text: Item.toDisplayName(e.recipe.result.id), bold: true, color: 'dark_purple' })
			e.page.push(rawtext('\n'))
			lineCount += 1
			if (e.recipe.result.data.display?.Lore) {
				e.page.push(JSON.parse(e.recipe.result.data.display?.Lore))
				e.page.push(rawtext('\n'))
				lineCount += 1
			}
			console.log(e.recipe.result.data.Enchantments, e.recipe.result.data.StoredEnchantments)
			for (const enchantment of [
				...(e.recipe.result.data.Enchantments || []),
				...(e.recipe.result.data.StoredEnchantments || []),
			]) {
				e.page.push({ text: `${Item.toDisplayName(enchantment.id)} ${arabToRoman(enchantment.lvl)}\n`, color: 'gray' })
				lineCount += 1
			}
			if (e.recipe.result.count > 1) {
				e.page.push({ text: ` [x${this.count}]\n`, color: 'light_purple' })
			}
			lineCount += 1
		} else {
			e.page.push({ text: `${Item.toDisplayName(Recipe.stringifyMaterial(e.recipe.data.result))}`, bold: true, color: 'dark_purple' })
			e.page.push({ text: ` [x${e.recipe.data.result.count || 1}]\n`, color: 'light_purple' })
			lineCount += 1
		}

		if (e.recipe.data.type === 'minecraft:crafting_shaped') {
			const table = cloneDeep(e.recipe.data.pattern)
			for (const i in table) { table[i] = `${table[i]}` }

			let count = 0
			const colorMap: { [K: string]: MinecraftColor } = {}
			for (const key in e.recipe.data.key) {
				colorMap[key] = PatternColor[count++]
			}

			if (lineCount < 9) { e.page.push(rawtext('\n')) }
			for (const i in table) {
				const line = []
				for (const key of table[i]) {
					line.push({ text: key, bold: true, color: colorMap[key] })
				}
				e.page.push(center(line, 28))
				e.page.push(rawtext('\n'))
			}
			if (lineCount < 9) { e.page.push(rawtext('\n')) }

			for (const key in e.recipe.data.key) {
				const item = e.recipe.data.key[key]
				e.page.push({ text: ` [${key}] `, bold: true, color: colorMap[key] })
				e.page.push({ text: Recipe.stringifyMaterial(item), color: 'dark_gray' })
				e.page.push({ text: '\n' })
			}

		} else {
			e.page.push({ text: '\n(Not Supported)\n', bold: true, color: 'red' })
		}

		pages.push(e.page)

		pages[Math.floor(e.index / 10)].push([
			{ text: `#${e.index + 1}. `, color: 'dark_gray' },
			{
				text: e.recipe.displayName + '\n',
				clickEvent: {
					action: 'change_page',
					value: pages.length,
				}
			},
		])
	}

	return {
		id: 'minecraft:written_book',
		data: {
			title: title,
			author: 'Insane Minecraft Compiler',
			pages: pages.map(p => stringifyRawText(p.flat()))
		}
	}
}