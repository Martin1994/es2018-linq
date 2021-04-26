import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    secondHalf: Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should concat two non-empty iterables",
            input: [0, 1, 2, 3],
            output: [0, 1, 2, 3, 4, 5, 6],
            secondHalf: [4, 5, 6]
        },
        {
            name: "should concat with empty first half",
            input: [],
            output: [0, 0, 0],
            secondHalf: [0, 0, 0]
        },
        {
            name: "should concat with empty second half",
            input: [0, 0, 0],
            output: [0, 0, 0],
            secondHalf: []
        },
        {
            name: "should concat two empty iterables",
            input: [],
            output: [],
            secondHalf: []
        }
    ])("Concat", ({name, input, output, secondHalf}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).concat(secondHalf).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().concat(secondHalf).toArray()).toEqual(output);
        });
    });
});
