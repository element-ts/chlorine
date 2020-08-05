/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {
	ClCommandHandlerParam, ClCommandHandlerReturnPromisified,
	ClCommandHandlerStructure,
	ClCommandName,
	ClRegistrar,
	ClRegistry,
	CLRegistryStructure
} from "./ClRegistry";

export abstract class ClCommander<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, R> implements ClRegistrar<LC, RC, R>{

	protected registry: ClRegistry<LC, RC, R>;

	protected constructor() {

		this.registry = new ClRegistry();

	}

	protected abstract onImplement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C, R>): void;
	protected abstract async onInvoke<C extends ClCommandName<RC>>(command: C, param: ClCommandHandlerParam<RC, C>): ClCommandHandlerReturnPromisified<RC, C>;

	public implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C, R>): void {

		this.registry.implement(command, handler);
		this.onImplement(command, handler);

	}

	public invoke<C extends ClCommandName<RC>>(command: C, param: ClCommandHandlerParam<RC, C>): ClCommandHandlerReturnPromisified<RC, C> {
		return this.onInvoke(command, param);
	}

}
