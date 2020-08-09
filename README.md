# @element-ts/chlorine
An abstracted, async, easy to use, type-safe function invocation event handler framework.

## Example
The below example is actually from a test for this package. You can see how to create a commanded object and in the test example a simple handler is provided.
```typescript
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

```

## Basics
### `ClCommander`
The `ClCommander` is the main thing you will interface with. It is an `abstract` class, again this is all written in
TypeScript. Extend this class and you will only have to do two things. Supply a `referencer` to the `super()` call and
implement the abstract `send(packet: string): Promise<void>` method. You can attach anything you need to your class and
just handle sending data out. When you get data in, call the protected method `receive(packet: string): Promise<void>`.
The commander will handle everything else for you.

There are three generic types. `LC` stands for _"local commands"_, `RC` stands for _"remote commands"_, and `R` stands
for _"referencer"_. A commander implements its own local commands, invokes its remote commands and passes the referencer
to itself when implementing commands. This can be useful to pass the socket or id so it is always available when
implementing commands.

### `ClMessageManager`
The message manager is a class used to store messages and generate unique ids for them. Once a command is invoked and
the response is received, the handler in the message manager is given back.

### `ClRegistry`
The registry handles what commands are implemented on one side.
