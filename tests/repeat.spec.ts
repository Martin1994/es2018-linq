import { AsyncEnumerable, Enumerable } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: boolean;
    predicate?: (x: number) => boolean;
}

describe("LINQ", () => {
    describe("Repeat", () => {
        it("should generate a synchronous iterator with given count", () => {
            expect(Enumerable.repeat(2, 3).toArray()).toEqual([2, 2, 2]);
        });

        it("should generate an asynchronous iterator with given count", async () => {
            expect(await AsyncEnumerable.repeat(2, 3).toArray()).toEqual([2, 2, 2]);
        });

        it("should generate an empty synchronous iterator with 0 count", () => {
            expect(Enumerable.repeat(2, 0).toArray()).toEqual([]);
        });

        it("should generate an empty asynchronous iterator with 0 count", async () => {
            expect(await AsyncEnumerable.repeat(2, 0).toArray()).toEqual([]);
        });
    });
});
