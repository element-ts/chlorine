/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {
	ClCommandHandler,
	ClCommandHandlerParam, ClCommandHandlerReturnPromisified,
	ClCommandHandlerStructure,
	ClCommandName,
	ClRegistrar,
	ClRegistry,
	CLRegistryStructure
} from "./ClRegistry";
import {ClMessage, ClMessageHandler, ClMessageManager} from "./ClMessageManager";
import {PromResolve, PromReject} from "@elijahjcobb/prom-type";
import {OAny, OObjectType, OOptional, OStandardType} from "@element-ts/oxygen";
import {Neon} from "@element-ts/neon";
import {BetterJSON} from "@elijahjcobb/better-json";

export interface ClCommanderConfig {
	debug?: boolean;
}

export abstract class ClCommander<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, R> implements ClRegistrar<LC, RC, R>{

	private readonly referencer: R;
	protected readonly registry: ClRegistry<LC, RC, R>;
	protected readonly messageManager: ClMessageManager;
	public static readonly logger: Neon = new Neon();

	protected constructor(referencer: R, config?: ClCommanderConfig) {

		this.referencer = referencer;
		this.registry = new ClRegistry();
		this.messageManager = new ClMessageManager();

		if (config?.debug === true) {
			ClCommander.logger.setTitle("@element-ts/chlorine - CLCommander");
			ClCommander.logger.enable();
		}

	}

	private async handleOnReturn(message: ClMessage): Promise<void> {

		ClCommander.logger.log(`Message (${message.id}) is a response.`);

		const handler: ClMessageHandler | undefined = this.messageManager.get(message.id);
		if (handler === undefined) {
			ClCommander.logger.err("ClSocket.handleOnReturn(): Handler not found for message id.");
			return;
		}

		handler(message);

	}

	protected abstract async send(packet: string): Promise<void>;

	protected async sendMessage(message: ClMessage): Promise<void> {

		let msgString: string;

		try {
			msgString = JSON.stringify(message);
		} catch (e) {
			ClCommander.logger.err(e);
			ClCommander.logger.err("Could not convert ClMessage to a string.");
			return;
		}

		this.send(msgString).catch(console.error);

	}

	public async receive(packet: string): Promise<void> {

		if (!OStandardType.string.conforms(packet)) {
			ClCommander.logger.err("ClSocket.onMessage(): Data received was not an instance of string.");
			return;
		}

		ClCommander.logger.log(`Did receive message (${packet.length.toLocaleString()} bytes).`);

		let message: ClMessage;

		try {
			message = BetterJSON.parse(packet);
		} catch (e) {
			ClCommander.logger.err("ClSocket.onMessage(): Data received was able to parse to JSON.");
			return;
		}

		const requiredType = OObjectType.follow({
			timestamp: OStandardType.number,
			command: OStandardType.string,
			id: OStandardType.string,
			param: OOptional.maybe(OAny.any())
		});

		ClCommander.logger.log(`Did parse message (${message.id}) -> '${packet}'.`);

		const isValid: boolean = requiredType.conforms(message);

		if (!isValid) {
			ClCommander.logger.err(message);
			ClCommander.logger.err("ClSocket.onMessage(): Data received did not conform to chlorine message types.");
			return;
		}

		const command: string = message.command;

		if (command === "return" || command === "error") return this.handleOnReturn(message);

		ClCommander.logger.log(`Looking for handler for message (${message.id}).`);
		const handler: ClCommandHandler<any> | undefined = this.registry.getHandlerForCommand(command);


		if (handler === undefined) {

			await this.sendMessage({
				timestamp: message.timestamp,
				command: "error",
				param: new Error("Command does not exist."),
				id: message.id
			});

			ClCommander.logger.err("ClSocket.onMessage(): Command not found.");

			return;
		}

		ClCommander.logger.log(`Found handler for message (${message.id}).`);

		const param: any = message.param;

		try {

			const returnValue: any = await handler(param, this.referencer);

			await this.sendMessage({
				timestamp: message.timestamp,
				command: "return",
				param: returnValue,
				id: message.id
			});

		} catch (e) {

			ClCommander.logger.err(e);

			let formattedError: any = e;
			if (e instanceof Error) formattedError = { error: e.message };

			await this.sendMessage({
				timestamp: message.timestamp,
				command: "error",
				param: formattedError,
				id: message.id
			});

		}

	}

	public implement<C extends ClCommandName<LC>>(command: C, handler: ClCommandHandlerStructure<LC, RC, C, R>): void {

		this.registry.implement(command, handler);

	}

	public invoke<C extends ClCommandName<RC>>(command: C, param: ClCommandHandlerParam<RC, C>): ClCommandHandlerReturnPromisified<RC, C> {
		return new Promise((resolve: PromResolve<any>, reject: PromReject): void => {

			const handler: (message: ClMessage) => void = (message: ClMessage): void => {

				if (message.command === "return") resolve(message.param);
				else reject(message.param);

			};

			const id: string = this.messageManager.put(handler);
			this.sendMessage({
				id,
				command,
				param,
				timestamp: Date.now()
			}).catch(console.error);

		});
	}

}
