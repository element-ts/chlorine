/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {ClCommander} from "./ClCommander";


export interface ClMessage<T = any> {
	id: string;
	timestamp: number;
	command: string;
	param: T;
}

export type ClMessageHandler = (message: ClMessage) => void;

export class ClMessageManager {

	private messages: Map<string, ClMessageHandler>;

	public constructor() {

		this.messages = new Map<string, ClMessageHandler>();

	}

	public put(handler: ClMessageHandler): string {

		ClCommander.logger.log("Will generate new id for message.");
		let id: string = ClMessageManager.randomId();
		ClCommander.logger.log(`Did generate id: '${id}' for message.`);
		let retryCount = 0;
		while (this.messages.has(id)) {

			ClCommander.logger.log(`The identifier created experienced a collision. Retrying.`);
			id = ClMessageManager.randomId();

			retryCount++;

			if (retryCount > 1_000) {
				ClCommander.logger.err(`Identifier collision occurred 1,000 times. Throwing error.`);
				throw new Error("Identifier collision occurred 1,000 times.");
			}

		}

		this.messages.set(id, handler);
		ClCommander.logger.log("Added handler to cache.");

		return id;

	}

	public get(id: string): ClMessageHandler | undefined {

		ClCommander.logger.log(`Will fetch handler for id: '${id}'.`);
		const handler = this.messages.get(id);
		if (handler === undefined) {
			ClCommander.logger.log(`Could not fetch handler for id: '${id}'.`);
			return undefined;
		}
		ClCommander.logger.log(`Deleting handler for id: '${id}'.`);
		this.messages.delete(id);
		return handler;

	}

	public size(): number {

		return this.messages.size;

	}

	private static randomId(length: number = 16): string {

		let result = "";
		const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < length; i++) result += options[Math.floor(Math.random() * options.length)];

		return result;

	}


}
