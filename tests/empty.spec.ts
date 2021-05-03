import { AsyncEnumerable, Enumerable } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: boolean;
    readonly predicate?: (x: number) => boolean;
}

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
