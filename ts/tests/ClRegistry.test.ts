/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {ClRegistry, CLRegistryStructure} from "../index";
import exp = require("constants");

interface LC extends CLRegistryStructure<LC> {
	x: {
		param: void;
		return: number;
	};
}

interface RC extends CLRegistryStructure<RC> {
	y: {
		param: number;
		return: void;
	};
}

test("Types", function () {

	const registry = new ClRegistry<LC, RC>();

	registry.implement("x", async () => {
		return 1;
	});

	expect(1).toEqual(1);

});

test("Implement", () => {

	const registry = new ClRegistry<LC, RC>();
	const num = 1000;

	for (let i: number = 0; i < num; i++) {
		registry.implement("x", async () => { return 1; });
	}

	expect(registry.size()).toEqual(1);

});

test("Get Handler", () => {

	const registry = new ClRegistry<LC, RC>();
	registry.implement("x", async () => { return 1; });
	let handler = registry.getHandlerForCommand("x");
	handler = registry.getHandlerForCommand("x");

	expect(handler).toBeDefined();


});

test("Handler Evaluation", async() => {

	const registry = new ClRegistry<LC, RC>();
	const num = 1337;
	registry.implement("x", async () => { return num; });
	const handler = registry.getHandlerForCommand("x");
	expect(handler).toBeDefined();
	if (handler === undefined) return;
	const value = await handler(undefined);
	expect(value).toEqual(num);


});

