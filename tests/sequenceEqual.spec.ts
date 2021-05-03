import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: boolean;
    readonly that: Iterable<number>;
    readonly comparer?: (x: number, y: number) => boolean
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return true without comparer when this and that are identical",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: true,
            that: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        {
            name: "should return true with comparer when this and that are identical",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: true,
            that: [0, -1, 2, -3, 4, -5, 6, -7, 8, -9],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should return false without comparer when this is shorter",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            output: false,
            that: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        {
            name: "should return false without comparer when this is shorter",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            output: false,
            that: [0, -1, 2, -3, 4, -5, 6, -7, 8, -9],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should return false without comparer when this is empty",
            input: [],
            output: false,
            that: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        {
            name: "should return false without comparer when this is empty",
            input: [],
            output: false,
            that: [0, -1, 2, -3, 4, -5, 6, -7, 8, -9],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should return false without comparer when that is shorter",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            name: "should return false without comparer when that is shorter",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: [0, -1, 2, -3, 4, -5, 6, -7, 8],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should return false without comparer when that is empty",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: []
        },
        {
            name: "should return false with comparer when that is empty",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: [],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should return true without comparer when both this and that are empty",
            input: [],
            output: true,
            that: []
        },
        {
            name: "should return true with comparer when both this and that are empty",
            input: [],
            output: true,
            that: [],
            comparer: (x, y) => false
        },
        {
            name: "should return false without comparer when there exists a different element",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: [0, 1, 2, 3, 4, 5, 6, 7, 80, 9]
        },
        {
            name: "should return false with comparer when there exists a different element",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: false,
            that: [0, -1, 2, -3, 4, -5, 6, -7, 80, -9],
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        }
    ])("SequenceEqual", ({name, input, output, that, comparer}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).sequenceEqual(that, comparer)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous that${comparer ? " with synchronous comparer" : ""}`, async () => {
            expect(await from(input).asAsync().sequenceEqual(that, comparer)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous that${comparer ? " with synchronous comparer" : ""}`, async () => {
            expect(await from(input).asAsync().sequenceEqual(from(that).asAsync(), comparer)).toEqual(output);
        });

        if (comparer) {
            it(`${name} asynchronously with synchronous that with asynchronous comparer`, async () => {
                expect(await from(input).asAsync().sequenceEqual(that, (x, y) => Promise.resolve(comparer(x, y)))).toEqual(output);
            });
            it(`${name} asynchronously with asynchronous that with asynchronous comparer`, async () => {
                expect(await from(input).asAsync().sequenceEqual(from(that).asAsync(), (x, y) => Promise.resolve(comparer(x, y)))).toEqual(output);
            });
        }
    });
});
