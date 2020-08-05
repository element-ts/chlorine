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

export abstract class ClCommander<LC extends CLRegistryStructure<LC>, RC extends CLRegistryStructure<RC>, R> implements ClRegistrar<LC, RC, R>{

	protected registry: ClRegistry<LC, RC, R>;
	protected messageManager: ClMessageManager;
	protected logger: Neon;

	protected constructor() {

		this.registry = new ClRegistry();
		this.messageManager = new ClMessageManager();
		this.logger = new Neon();
		this.logger.setTitle("@element-ts/chlorine - CLCommander");

	}

	private async handleOnReturn(message: ClMessage): Promise<void> {

		this.logger.log(`Message (${message.id}) is a response.`);

		const handler: ClMessageHandler | undefined = this.messageManager.get(message.id);
		if (handler === undefined) {
			this.logger.err("ClSocket.handleOnReturn(): Handler not found for message id.");
			return;
		}

		handler(message);

	}

	public abstract async send(packet: string): Promise<void>;

	protected async sendMessage(message: ClMessage): Promise<void> {

		let msgString: string;

		try {
			msgString = JSON.stringify(message);
		} catch (e) {
			this.logger.err(e);
			this.logger.err("Could not convert ClMessage to a string.");
			return;
		}

		this.send(msgString).catch(console.error);

	}

	public async receive(packet: string): Promise<void> {

		if (!OStandardType.string.conforms(packet)) {
			this.logger.err("ClSocket.onMessage(): Data received was not an instance of string.");
			return;
		}

		this.logger.log(`Did receive message (${packet.length.toLocaleString()} bytes).`);

		let message: ClMessage;

		try {
			message = BetterJSON.parse(packet);
		} catch (e) {
			this.logger.err("ClSocket.onMessage(): Data received was able to parse to JSON.");
			return;
		}

		const requiredType = OObjectType.follow({
			timestamp: OStandardType.number,
			command: OStandardType.string,
			id: OStandardType.string,
			param: OOptional.maybe(OAny.any())
		});

		this.logger.log(`Did parse message (${message.id}) -> '${packet}'.`);

		const isValid: boolean = requiredType.conforms(message);

		if (!isValid) {
			this.logger.err(message);
			this.logger.err("ClSocket.onMessage(): Data received did not conform to lithium message types.");
			return;
		}

		const command: string = message.command;

		if (command === "return" || command === "error") return this.handleOnReturn(message);

		this.logger.log(`Looking for handler for message (${message.id}).`);
		const handler: ClCommandHandler<any> | undefined = this.registry.getHandlerForCommand(command);


		if (handler === undefined) {

			await this.sendMessage({
				timestamp: message.timestamp,
				command: "error",
				param: new Error("Command does not exist."),
				id: message.id
			});

			this.logger.err("ClSocket.onMessage(): Command not found.");

			return;
		}

		this.logger.log(`Found handler for message (${message.id}).`);

		const param: any = message.param;

		try {

			const returnValue: any = await handler(param, this);

			await this.sendMessage({
				timestamp: message.timestamp,
				command: "return",
				param: returnValue,
				id: message.id
			});

		} catch (e) {

			this.logger.err(e);

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
