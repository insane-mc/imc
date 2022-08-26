import path from 'path'

import { Context } from '../../src/index'


const ctx = new Context()

const recipe = ctx.recipe({
	name: 'test',
	recipe: [
		['minecraft:dirt', 'minecraft:dirt', 'minecraft:dirt'],
		['minecraft:dirt', null, 'minecraft:dirt'],
		['minecraft:dirt', 'minecraft:dirt', { item: 'minecraft:dirt' }],
	],
	result: 'minecraft:stone',
	resultCount: 9,
})
ctx.logger.debug(recipe.data)

// Apprentice Helmet
// Apprentice Sword
// Apprentice Bow
// Master's Compass

// Vorpal Sword
// Enchanted Book (Sharpness I)
// Enchanted Book (Power I)
// Dragon Sword

// Leather
// Enchanted Book (Protection I)
// Enchanted Book (Projectile Protection I)
// Dragon Armor

// Glowstone Dust
// Nether Wart
// Potion of Regeneration
// Blaze Rod

// Steak
// Potion of Resistance
// Spiked Armor
// Seven-league Boots

// Iron Ingot
// 

ctx.config('dist', path.join(__dirname, '../../dist/hypixel-uhc-recipe'))
ctx.build()

ctx.config('dist', path.join('D:\\Game\\Minecraft\\.minecraft\\versions\\1.19 fabric\\saves\\imc-test\\datapacks','uhc-recipe'))
ctx.build()