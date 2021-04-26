import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    comparer?: (x: number, y: number) => number;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return distinct elements with more than 1 elements",
            input: [0, 1, 2, 0, 0, 2],
            output: [0, 1, 2],
            comparer: (x, y) => x - y
        },
        {
            name: "should return distinct elements with 1 element",
            input: [0],
            output: [0],
            comparer: (x, y) => x - y
        },
        {
            name: "should return distinct elements with 0 elements",
            input: [],
            output: [],
            comparer: (x, y) => x - y
        },
        {
            name: "should return distinct elements with more than 1 elements without comparer",
            input: [0, 1, 2, 0, 0, 2],
            output: [0, 1, 2]
        },
        {
            name: "should return distinct elements with 1 element without comparer",
            input: [0],
            output: [0]
        },
        {
            name: "should return distinct elements with 0 elements without comparer",
            input: [],
            output: []
        }
    ])("Distinct", ({name, input, output, comparer}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).distinct(comparer).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().distinct(comparer).toArray()).toEqual(output);
        });
    });
});
