import { from } from "../src";

export interface TestCase {
    name: string;
    input: number[];
    output: number[];
    count: number;
}

describe("LINQ", () => {
    const testCases: TestCase[] = [
        {
            name: "should skip given count",
            input: [0, 1, 2, 3],
            output: [2, 3],
            count: 2
        },
        {
            name: "should skip all when count is greater than length",
            input: [0, 1, 2, 3],
            output: [],
            count: 5
        },
        {
            name: "should skip nothing when count is 0",
            input: [0, 1, 2, 3],
            output: [0, 1, 2, 3],
            count: 0
        },
        {
            name: "should handle empty input",
            input: [],
            output: [],
            count: 0
        }
    ];

    describe.each<TestCase>(testCases)("Skip", ({name, input, output, count}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).skip(count).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().skip(count).toArray()).toEqual(output);
        });
    });

    describe.each<TestCase>(testCases)("Take", ({name, input, output, count}) => {
        output = output.length === 0 ? input : input.slice(0, -output.length);
        name = name.replace("skip", "take");

        it(`${name} synchronously`, () => {
            expect(from(input).take(count).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().take(count).toArray()).toEqual(output);
        });
    });
});
