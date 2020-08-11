/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {ClCommander} from "./ClCommander";

export interface ClRegistrar<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>> {
	implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C>): void;
}

export type ClCommandRegistryCommand<P = any, R = any> = {param: P, return: R};
export type CLRegistryStructure<T extends object = object> = { [key in keyof T]: ClCommandRegistryCommand; };
export type ClCommandHandler<P = any, R = any> = (value: P) => Promise<R>;
export type ClCommandName<T extends CLRegistryStructure> = (keyof T) & string;
export type ClCommand<T extends CLRegistryStructure, C extends ClCommandName<T>> = T[C];
export type ClCommandHandlerParam<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = ClCommand<T, C>["param"];
export type ClCommandHandlerReturn<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = ClCommand<T, C>["return"];
export type ClCommandHandlerReturnPromisified<T extends CLRegistryStructure<T>, C extends ClCommandName<T>> = Promise<ClCommandHandlerReturn<T, C>>;
export type ClCommandHandlerStructure<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, C extends ClCommandName<LC>> = (value: ClCommandHandlerParam<LC, C>) => ClCommandHandlerReturnPromisified<LC, C>;

export class ClRegistry<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>> implements ClRegistrar<LC, RC>{

	private commands: Map<string, ClCommandHandler>;

	public constructor() {

		this.commands = new Map<string, ClCommandHandler>();
		ClCommander.logger.log("Generated CLRegistry internal command map.");

	}

	public implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C>): void {

		ClCommander.logger.log(`Will implement command '${command}'.`);
		this.commands.set(command, handler);
		ClCommander.logger.log(`Did implement command '${command}'.`);

	}

	public getHandlerForCommand(command: string): ClCommandHandler | undefined {

		ClCommander.logger.log(`Will fetch handler for command '${command}'.`);
		const handler = this.commands.get(command);
		if (handler) ClCommander.logger.log(`Did fetch handler for command '${command}'.`);
		else ClCommander.logger.err(`Could not find handler for command '${command}'.`);
		return handler;

	}

	public size(): number {
		return this.commands.size;
	}

}
