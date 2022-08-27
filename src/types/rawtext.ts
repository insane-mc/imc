import { UUID } from './id'
import { ItemNBT, NBTPath } from './nbt'


// https://wiki.biligame.com/mc/%E5%8E%9F%E5%A7%8BJSON%E6%96%87%E6%9C%AC%E6%A0%BC%E5%BC%8F
export type RawText = string | boolean | number | RawTextObject | Array<RawTextObject>

export type RawTextComponent = {
	text: string
} | {
	translate: string
	with: Array<RawTextComponent>
} | {
	score: {
		name: string
		objective: string
	}
} | {
	selector: string
	separator: RawTextComponent
} | {
	keybind: string   // https://wiki.biligame.com/mc/%E6%8E%A7%E5%88%B6#可设置的键位
} | {
	nbt: NBTPath
	interpret?: boolean
	separator: RawTextComponent
	block: string
	entity: string
	storage: string
}

export type RawTextObject = RawTextComponent & {
	// child object
	extra?: Array<RawTextObject>
	// format
	color?: MinecraftColor | HexColor
	font?: string
	bold?: boolean
	italic?: boolean
	underlined?: boolean
	strikethrough?: boolean
	obfuscated?: boolean
	// event
	insertion?: string
	clickEvent?: {
		action: 'open_url' | 'open_file' | 'run_command' | 'suggest_command' | 'change_page' | 'copy_to_clipboard'
		value: string
	}
	hoverEvent?: {
		action: 'show_text'
		contents: RawText
	} | {
		action: 'show_item'
		content?: {
			id?: string
			conut?: number
			tag?: ItemNBT
		}
	} | {
		action: 'show_entity'
		content?: {
			name?: string
			type?: string
			id?: UUID
		}
	}
}



export type HexWord =
	'0' | '1' | '2' | '3' | '4' |
	'5' | '6' | '7' | '8' | '9' |
	'A' | 'a' | 'B' | 'b' | 'C' |
	'c' | 'D' | 'd' | 'E' | 'e'
export type HexColor = `#${HexWord}${HexWord}${HexWord}`

export type DecimalColor = number


export type MinecraftColor =
	'black' | 'dark_blue' | 'dark_green' |
	'dark_aqua' | 'dark_red' | 'dark_purple' |
	'gold' | 'gray' | 'dark_gray' |
	'blue' | 'green' | 'aqua' |
	'red' | 'light_purple' | 'yellow' |
	'white' | 'reset'

export function stringifyRawText(data: RawTextObject | Array<RawTextObject>, plain: boolean = false): string {
	if (plain) {
		return [data].flat().map((obj: any) => (obj.text || '')).join('')
	}
	return JSON.stringify(data)
}