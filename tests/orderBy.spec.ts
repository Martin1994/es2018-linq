import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number[];
    readonly keySelector: (x: number) => string;
    readonly comparer?: (x: string, y: string) => number;
}

describe("LINQ", () => {

    const testCases: TestCase[] = [
        {
            name: "should sort with comparer",
            input: [1, 111, 1111, 11],
            output: [1, 11, 111, 1111],
            keySelector: x => x.toString(10),
            comparer: (x, y) => x.length - y.length
        },
        {
            name: "should sort with duplicate elements",
            input: [1, 2, 99, 2, 42],
            output: [1, 2, 2, 42, 99],
            keySelector: x => x.toString(10)
        },
        {
            name: "should sort without comparer",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: [0, 1, 8, 9, 2, 3, 4, 5, 6, 7],
            keySelector: x => "=" + x.toString(8)
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: [],
            keySelector: x => "",
            comparer: (x, y) => 0
        }
    ];

    describe.each<TestCase>(testCases)("OrderBy", ({name, input, output, keySelector, comparer}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).orderBy(keySelector, comparer).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().orderBy(keySelector, comparer).toArray()).toEqual(output);
        });
    });

    describe.each<TestCase>(testCases)("OrderByDescending", ({name, input, output, keySelector, comparer}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).orderByDescending(keySelector, comparer).toArray()).toEqual([...output].reverse());
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().orderByDescending(keySelector, comparer).toArray()).toEqual([...output].reverse());
        });
    });
});
