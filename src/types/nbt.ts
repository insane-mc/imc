import { NamespaceID, TagID } from "./id"
import { MinecraftEnhancement } from './minecraft'
import { RawText, DecimalColor } from "./rawtext"

export type NBT = ItemNBT | BlockNBT

export interface ItemNBT {
	Enchantments?: Array<{ id: MinecraftEnhancement, lvl: number }>
	display?: {
		Name?: string,   // in RawText format
		Lore?: string,   // in RawText format
		color?: DecimalColor,
	},
	AttributeModifiers?: any   // TODO
	CanPlaceOn?: Array<NamespaceID | TagID>
	CanDestroy?: Array<NamespaceID | TagID>
	BlockEntityTag?: BlockNBT,

	Unbreakable?: number,   // 0~1 integer
	SkullOwner?: string,
	HideFlags?: number,   // 0~127 integer
	generation?: number,   // 0~3 integer
	Damage?: number,

	StoredEnchantments?: Array<{ id: MinecraftEnhancement, lvl: number }>

	[K: string]: any
}

export interface BlockNBT {

}

export type NBTPath = any   // TODO
