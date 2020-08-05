/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */


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

		let id: string = ClMessageManager.randomId();
		while (this.messages.has(id)) id = ClMessageManager.randomId();
		this.messages.set(id, handler);

		return id;

	}

	public get(id: string): ClMessageHandler | undefined {

		return this.messages.get(id);

	}

	private static randomId(length: number = 16): string {

		let result = "";
		const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < length; i++) result += options[Math.floor(Math.random() * options.length)];

		return result;

	}


}
