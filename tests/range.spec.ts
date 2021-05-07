import { AsyncEnumerable, Enumerable } from "../src";

describe("LINQ", () => {
    describe("Range", () => {
        it("should generate a synchronous iterator with given range", () => {
            expect(Enumerable.range(2, 3).toArray()).toEqual([2, 3, 4]);
        });

        it("should generate an asynchronous iterator with given range", async () => {
            expect(await AsyncEnumerable.range(2, 3).toArray()).toEqual([2, 3, 4]);
        });

        it("should generate an empty synchronous iterator with empty range", () => {
            expect(Enumerable.range(2, 0).toArray()).toEqual([]);
        });

        it("should generate an empty asynchronous iterator with empty range", async () => {
            expect(await AsyncEnumerable.range(2, 0).toArray()).toEqual([]);
        });
    });
});
