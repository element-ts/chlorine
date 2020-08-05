/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

export interface ClRegistrar<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, R> {
	implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C, R>): void;
}

export type ClCommandRegistryCommand<P = any, R = any> = {param: P, return: R};
export type CLRegistryStructure<T extends object = object> = { [key in keyof T]: ClCommandRegistryCommand; };
export type ClCommandHandler<R> = (value: any, referencer: R) => Promise<any>;
export type ClCommandName<T extends CLRegistryStructure> = (keyof T) & string;
export type ClCommand<T extends CLRegistryStructure, C extends ClCommandName<T>> = T[C];
export type ClCommandHandlerParam<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = ClCommand<T, C>["param"];
export type ClCommandHandlerReturn<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = ClCommand<T, C>["return"];
export type ClCommandHandlerReturnPromisified<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = Promise<ClCommandHandlerReturn<T, C>>;
export type ClCommandHandlerStructure<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, C extends ClCommandName<LC>, R> = (value: ClCommandHandlerParam<LC, C>, referencer: R) => ClCommandHandlerReturnPromisified<LC, C>;

export class ClRegistry<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, R> implements ClRegistrar<LC, RC, R>{

	private commands: Map<string, ClCommandHandler<R>>;

	public constructor() {

		this.commands = new Map<string, ClCommandHandler<R>>();

	}

	public implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C, R>): void {

		this.commands.set(command, handler);

	}

	public getHandlerForCommand(command: string): ClCommandHandler<R> | undefined {

		return this.commands.get(command);

	}

}
