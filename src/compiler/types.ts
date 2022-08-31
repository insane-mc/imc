import { Context } from '../context'
import { IMCLToken } from './token'


export interface CompileOptions {
	context?: Context
	path?: string
}

export interface CompileResult {

}



export enum Token {
	// internal
	space,
	space_newline,
	space_internal,
	name,
	number,
	command,
	integer,
	params,
	condition,
	statement,

	// expression
	namespace,
	dir,
	if,
	for,
	while,
	function,
	decorator,

	// call
	call_function,
}