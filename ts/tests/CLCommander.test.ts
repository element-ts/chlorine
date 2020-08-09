/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {ClCommander, CLRegistryStructure} from "../index";

interface SideACommands extends CLRegistryStructure<SideACommands> {
	increment: {
		param: number;
		return: number;
	};
}

interface SideBCommands extends CLRegistryStructure<SideBCommands> {
	decrement: {
		param: number;
		return: number;
	};
}

class SideA extends ClCommander<SideACommands, SideBCommands, number> {

	public handler: ((packet: string) => Promise<void>) | undefined;

	public constructor() {

		super(1337);

	}

	protected async send(packet: string): Promise<void> {

		if (this.handler) await this.handler(packet);

	}

}

class SideB extends ClCommander<SideBCommands, SideACommands, number> {

	public handler: ((packet: string) => Promise<void>) | undefined;

	public constructor() {

		super(1337);

	}

	protected async send(packet: string): Promise<void> {

		if (this.handler) await this.handler(packet);

	}

}

test("General", async () => {

	const a = new SideA();
	const b = new SideB();

	a.handler = (packet => b.receive(packet));
	b.handler = (packet => a.receive(packet));

	a.implement("increment", async num => num + 1);
	b.implement("decrement", async num => num - 1);

	const testSize = 100;

	let numA = 0;
	let numB = testSize;

	for (let i: number = 0; i < testSize; i++) {
		numA = await b.invoke("increment", numA);
		numB = await a.invoke("decrement", numB);
	}

	expect(numA).toEqual(testSize);
	expect(numB).toEqual(0);

});
