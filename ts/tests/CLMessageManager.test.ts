/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {ClMessageManager} from "../index";
import exp = require("constants");

test("Put", async () => {

	const manager = new ClMessageManager();

	const id = manager.put(() => { return "Hello, world!"; });

	expect(manager.size()).toEqual(1);
	expect(id).toBeDefined();

});

test("Get", async () => {

	const manager = new ClMessageManager();
	const msg = "Hello, world!";
	const id = manager.put(() => { return msg; });

	expect(manager.size()).toEqual(1);
	expect(id).toBeDefined();

	const handler = manager.get(id);
	expect(handler).toBeDefined();
	if (handler === undefined) return;
	expect(manager.size()).toEqual(0);
	expect(handler({command: "", id: "", param: 1, timestamp: 1})).toEqual(msg);

});

test("Mass", async () => {

	const manager = new ClMessageManager();
	const defaultMessage = {command: "", id: "", param: 1, timestamp: 1};
	const testSize = 1000;
	const ids: string[] = [];

	for (let i: number = 0; i < testSize; i++) {
		const id = manager.put(() => { return i; });
		expect(id).toBeDefined();
		ids.push(id);
	}

	expect(manager.size()).toEqual(testSize);

	for (let i: number = 0; i < testSize; i++) {

		const id: string = ids[i];
		const handler = manager.get(id);
		expect(handler).toBeDefined();
		if (handler === undefined) return;
		const res = handler(defaultMessage);
		expect(res).toEqual(i);

	}

	expect(manager.size()).toEqual(0);


});
