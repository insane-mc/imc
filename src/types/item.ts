import { NamespaceID } from "./id";
import { ItemNBT } from "./nbt";

export interface CommonItemLabel {
	id: NamespaceID,
	tag: ItemNBT,
	Slot: number,
	Count: number,
}