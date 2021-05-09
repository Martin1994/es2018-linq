import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: boolean;
    readonly value: number;
    readonly comparer?: (x: number, y: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to return true",
            input: [0, 0, 0, 0, -1],
            output: true,
            value: 1,
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should be able to return false",
            input: [0, 0, 0, 0, 0],
            output: false,
            value: 1,
            comparer: (x, y) => Math.abs(x) === Math.abs(y)
        },
        {
            name: "should be able to return true without comparer",
            input: [0, 0, 0, 0, 1],
            output: true,
            value: 1
        },
        {
            name: "should be able to return false without comparer",
            input: [0, 0, 0, 0, 0],
            output: false,
            value: 1
        },
        {
            name: "should be able to handle empty iterables",
            input: [],
            output: false,
            value: 1,
            comparer: (_x, _y) => true
        }
    ])("Contains", ({name, input, output, value, comparer}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).contains(value, comparer!)).toEqual(output);
        });

        it(`${name} asynchronously${comparer ? "with synchronous comparer" : ""}`, async () => {
            expect(await from(input).asAsync().contains(value, comparer!)).toEqual(output);
        });

        if (comparer) {
            it(`${name} asynchronously with asynchronous comparer`, async () => {
                expect(await from(input).asAsync().contains(value, async (x) => Promise.resolve(comparer(value, x)))).toEqual(output);
            });
        }
    });
});
