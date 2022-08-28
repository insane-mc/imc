import { Context, stringifyRawText, generateRecipeBook } from 'insane-mc'
import { merge } from 'lodash'
import path from 'path'


const ctx = (new Context())
	.namespace('uhc.recipe')

// Apprentice Helmet
ctx.recipe({
	name: 'apprentice_helmet',
	recipe: [
		['iron_ingot', 'iron_ingot', 'iron_ingot'],
		['iron_ingot', 'redstone_torch', 'iron_ingot'],
	],
	result: ctx.item({
		id: 'minecraft:iron_helmet',
		data: {
			display: { Name: stringifyRawText({ text: 'Apprentice Helmet' }) },
			Enchantments: [
				{ id: 'minecraft:protection', lvl: 1 },
				{ id: 'minecraft:fire_protection', lvl: 1 },
				{ id: 'minecraft:blast_protection', lvl: 1 },
				{ id: 'minecraft:projectile_protection', lvl: 1 },
			],
		}
	}),
})
// Apprentice Sword
// Apprentice Bow
// Master's Compass

// Vorpal Sword
ctx.recipe({
	name: 'vorpal_sword',
	recipe: [
		['bone'],
		['iron_sword'],
		['rotten_flesh'],
	],
	result: ctx.item({
		id: 'minecraft:iron_sword',
		data: {
			display: { Name: stringifyRawText({ text: 'Vorpal Sword' }) },
			Enchantments: [
				{ id: 'minecraft:smite', lvl: 2 },
				{ id: 'minecraft:looting', lvl: 1 },
				{ id: 'minecraft:bane_of_arthropods', lvl: 2 },
			],
		}
	}),
})
// Enchanted Book (Sharpness I)
ctx.recipe({
	name: 'enchanted_book_sharpness',
	displayName: 'Sharpness Enchant Book',
	recipe: [
		['flint', null, null],
		[null, 'paper', 'paper'],
		[null, 'paper', 'iron_sword'],
	],
	result: ctx.item({
		id: 'minecraft:enchanted_book',
		data: { StoredEnchantments: [{ id: 'minecraft:sharpness', lvl: 1 }] }
	}),
})
// Enchanted Book (Power I)
ctx.recipe({
	name: 'enchanted_book_power',
	displayName: 'Power Enchanted Book',
	recipe: [
		['flint', null, null],
		[null, 'paper', 'paper'],
		[null, 'paper', 'bone'],
	],
	result: ctx.item({
		id: 'minecraft:enchanted_book',
		data: { StoredEnchantments: [{ id: 'minecraft:power', lvl: 1 }] }
	}),
})
// Dragon Sword

// Leather
ctx.recipe({
	name: 'economy_leather',
	displayName: 'Economy Leather',
	recipe: [
		['stick', 'leather', 'stick'],
		['stick', 'leather', 'stick'],
		['stick', 'leather', 'stick'],
	],
	result: 'leather',
	resultCount: 8,
})
// Enchanted Book (Protection I)
ctx.recipe({
	name: 'enchanted_book_protection',
	displayName: 'Protection Enchanted Book',
	recipe: [
		['paper', 'paper'],
		['paper', 'iron_ingot'],
	],
	result: ctx.item({
		id: 'minecraft:enchanted_book',
		data: { StoredEnchantments: [{ id: 'minecraft:protection', lvl: 1 }] }
	}),
})
// Enchanted Book (Projectile Protection I)
ctx.recipe({
	name: 'enchanted_book_projectile_protection',
	displayName: 'Projectile Protection Enchanted Book',
	recipe: [
		['paper', 'paper'],
		['paper', 'arrow'],
	],
	result: ctx.item({
		id: 'minecraft:enchanted_book',
		data: { StoredEnchantments: [{ id: 'minecraft:projectile_protection', lvl: 1 }] }
	}),
})
// Dragon Armor

// Glowstone Dust
ctx.recipe({
	name: 'glowstone_dust',
	displayName: 'Glowstone Dust',
	recipe: [
		['redstone', 'redstone', 'redstone'],
		['redstone', 'flint_and_steel', 'redstone'],
		['redstone', 'redstone', 'redstone'],
	],
	result: 'glowstone_dust',
	resultCount: 8,
})
// Nether Wart
ctx.recipe({
	name: 'nether_wart',
	displayName: 'Nether Wart',
	recipe: [
		[null, 'wheat_seeds', null],
		['wheat_seeds', 'fermented_spider_eye', 'wheat_seeds'],
		[null, 'wheat_seeds', null],
	],
	result: 'nether_wart',
})
// Potion of Regeneration
// Blaze Rod

// Steak
ctx.recipe({
	name: 'steak',
	displayName: 'Steak',
	recipe: [
		['beef', 'beef', 'beef'],
		['beef', 'coal', 'beef'],
		['beef', 'beef', 'beef'],
	],
	result: 'cooked_beef',
	resultCount: 10,
})
// Potion of Resistance
// Spiked Armor
ctx.recipe({
	name: 'spiked_armor',
	recipe: [
		['lily_pad'],
		['cactus'],
		['leather_chestplate'],
	],
	result: ctx.item({
		id: 'minecraft:leather_chestplate',
		data: {
			display: {
				Name: stringifyRawText({ text: 'Spiked Armor' }),
				color: 2129968   // Hex Color #208030
			},
			Enchantments: [
				{ id: 'minecraft:protection', lvl: 5 },
				{ id: 'minecraft:unbreaking', lvl: 10 },
				{ id: 'minecraft:thorns', lvl: 1 },
			],
		}
	}),
})
// Seven-league Boots
ctx.recipe({
	name: 'seven_league_boots',
	recipe: [
		['feather', 'ender_pearl', 'feather'],
		['feather', 'water_bucket', 'feather'],
		['feather', 'diamond_boots', 'feather'],
	],
	result: ctx.item({
		id: 'minecraft:diamond_boots',
		data: {
			display: { Name: stringifyRawText({ text: 'Seven-league Boots' }) },
			Enchantments: [
				{ id: 'minecraft:protection', lvl: 3 },
				{ id: 'minecraft:feather_falling', lvl: 3 },
				{ id: 'minecraft:depth_strider', lvl: 2 },   // temporary
			],
		}
	}),
})

// Iron Ingot
ctx.recipe({
	name: 'iron_ingot',
	displayName: 'Iron Ingot',
	recipe: [
		['raw_iron', 'raw_iron', 'raw_iron'],
		['raw_iron', 'coal', 'raw_iron'],
		['raw_iron', 'raw_iron', 'raw_iron'],
	],
	result: 'iron_ingot',
	resultCount: 10,
})
// Obsidian
ctx.recipe({
	name: 'obsidian',
	displayName: 'Obsidian',
	recipe: [
		['water_bucket'],
		['lava_bucket'],
	],
	result: 'obsidian',
})
// Tarnhelm
ctx.recipe({
	name: 'tarnhelm',
	recipe: [
		['diamond', 'iron_ingot', 'diamond'],
		['diamond', 'redstone_block', 'diamond'],
	],
	result: ctx.item({
		id: 'minecraft:diamond_helmet',
		data: {
			display: { Name: stringifyRawText({ text: 'Tarnhelm' }) },
			Enchantments: [
				{ id: 'minecraft:protection', lvl: 1 },
				{ id: 'minecraft:fire_protection', lvl: 1 },
				{ id: 'minecraft:aqua_affinity', lvl: 3 },
			],
		}
	}),
})
// Philosopher's Pickaxe
ctx.recipe({
	name: 'philosophers_pickaxe',
	recipe: [
		['raw_iron', 'raw_gold', 'raw_iron'],
		['lapis_block', 'stick', 'lapis_block'],
		[null, 'stick', null],
	],
	result: ctx.item({
		id: 'minecraft:diamond_pickaxe',
		data: {
			display: { Name: stringifyRawText({ text: 'Philosopherʼs Pickaxe' }) },
			Enchantments: [
				{ id: 'minecraft:fortune', lvl: 2 },
			],
			Damage: 1558,
		}
	}),
})

// Bottle o' Enchanting
ctx.recipe({
	name: 'experience_bottle',
	displayName: 'Bottle oʼ Enchanting',
	recipe: [
		[null, 'redstone_block', null],
		['redstone_block', 'glass_bottle', 'redstone_block'],
		[null, 'redstone_block', null],
	],
	result: 'experience_bottle',
	resultCount: 8,
})
// Anvil
ctx.recipe({
	name: 'anvil',
	displayName: 'Anvil',
	recipe: [
		['iron_ingot', 'iron_ingot', 'iron_ingot'],
		[null, 'iron_block', null],
		['iron_ingot', 'iron_ingot', 'iron_ingot'],
	],
	result: 'anvil',
})
// Enchantment Table
ctx.recipe({
	name: 'enchantment_table',
	displayName: 'Enchantment Table',
	recipe: [
		[null, 'bookshelf', null],
		['obsidian', 'diamond', 'obsidian'],
		['obsidian', 'experience_bottle', 'obsidian'],
	],
	result: 'enchantment_table',
})
// Artemis' Book
ctx.recipe({
	name: 'artemis_book',
	displayName: 'Artemisʼ Book',
	recipe: [
		['ender_eye', null, null],
		[null, 'paper', 'paper'],
		[null, 'paper', 'fire_charge'],
	],
	result: ctx.item({
		id: 'minecraft:enchanted_book',
		data: {
			StoredEnchantments: [
				{ id: 'minecraft:protection', lvl: 3 },
				{ id: 'minecraft:sharpness', lvl: 2 },
				{ id: 'minecraft:power', lvl: 2 },
				{ id: 'minecraft:punch', lvl: 1 },
				{ id: 'minecraft:fire_aspect', lvl: 1 },
			]
		}
	}),
})

// Apple
ctx.recipe({
	name: 'apple',
	displayName: 'Apple',
	recipe: [
		['bone_meal'],
		['apple'],
	],
	result: 'apple',
	resultCount: 2,
})
// Melon
ctx.recipe({
	name: 'melon',
	displayName: 'Melon',
	recipe: [
		['bone_meal', 'wheat_seeds', 'bone_meal'],
		['wheat_seeds', 'apple', 'wheat_seeds'],
		['bone_meal', 'wheat_seeds', 'bone_meal'],
	],
	result: 'melon',
})
// Potion of Absorption
// Golden Apple
ctx.recipe({
	name: 'golden_apple',
	displayName: 'Golden Apple',
	recipe: [
		[null, 'gold_ingot', null],
		['gold_ingot', 'apple', 'gold_ingot'],
		[null, 'gold_ingot', null],
	],
	result: 'golden_apple',
})

// Golden Head
ctx.recipe({
	name: 'golden_head',
	recipe: [
		['gold_ingot', 'gold_ingot', 'gold_ingot'],
		['gold_ingot', 'player_head', 'gold_ingot'],
		['gold_ingot', 'gold_ingot', 'gold_ingot'],
	],
	result: ctx.item({
		id: 'minecraft:player_head',
		data: {
			display: { Name: stringifyRawText({ text: 'Golden Head' }) },
			SkullOwner: 'PhantomTupac',
		}
	}),
})
// Pandora's Box
// Panacea
// Cupid's Bow

// Arrow
ctx.recipe({
	name: 'arrow',
	displayName: 'Arrow',
	recipe: [
		['flint', 'flint', 'flint'],
		['stick', 'stick', 'stick'],
		['feather', 'feather', 'feather'],
	],
	result: 'arrow',
	resultCount: 20,
})
// Saddle
ctx.recipe({
	name: 'saddle',
	displayName: 'Saddle',
	recipe: [
		['leather', 'leather', 'leather'],
		['string', 'leather', 'string'],
		['iron_ingot', null, 'iron_ingot'],
	],
	result: 'saddle',
})
// Potion of Velocity
// Fenrir

// Forge
// Efficiency Pickaxe
ctx.recipe({
	name: 'philosophers_pickaxe',
	recipe: [
		['raw_iron', 'raw_iron', 'raw_iron'],
		['coal', 'stick', 'coal'],
		[null, 'stick', null],
	],
	result: ctx.item({
		id: 'minecraft:iron_pickaxe',
		data: {
			display: { Name: stringifyRawText({ text: 'Efficiency Pickaxe' }) },
			Enchantments: [
				{ id: 'minecraft:efficiency', lvl: 1 },
			],
		}
	}),
})
// Lumber jack's Axe
// Enhancement Book (30 Level)

// Gold Ingot
ctx.recipe({
	name: 'gold_ingot',
	displayName: 'Gold Ingot',
	recipe: [
		['raw_gold', 'raw_gold', 'raw_gold'],
		['raw_gold', 'coal', 'raw_gold'],
		['raw_gold', 'raw_gold', 'raw_gold'],
	],
	result: 'gold_ingot',
	resultCount: 10,
})
// Sugar Canes
ctx.recipe({
	name: 'sugar_canes',
	displayName: 'Sugar Canes',
	recipe: [
		[null, 'oak_sapling', null],
		['raw_gold', 'coal', 'raw_gold'],
	],
	result: 'reeds',
	resultCount: 4,
})
// Backpack
// Fusion Armor


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

export async function build(ctx: Context) {
	ctx.config('source', __dirname)
	ctx.config('dist', path.join(__dirname, '../../dist/datapack-hypixel-uhc'))
	ctx.config('operation.build.copyReadme', true)
	await ctx.build()
}
build(ctx.root)