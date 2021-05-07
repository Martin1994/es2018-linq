import { AsyncEnumerable, Enumerable } from "../src";

describe("LINQ", () => {
    describe("Empty", () => {
        it("should generate an empty synchronous iterator", () => {
            expect(Enumerable.empty<number>().toArray()).toEqual([]);
        });

        it("should generate an empty asynchronous iterator", async () => {
            expect(await AsyncEnumerable.empty<number>().toArray()).toEqual([]);
        });
    });
});
