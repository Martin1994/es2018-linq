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
            name: "should skip given count (one buffer cycle)",
            input: [0, 1, 2, 3],
            output: [0, 1],
            count: 2
        },
        {
            name: "should skip given count (two buffer cycles)",
            input: [0, 1, 2, 3, 4 ,5],
            output: [0, 1, 2, 3],
            count: 2
        },
        {
            name: "should skip given count (less than one buffer)",
            input: [0, 1, 2, 3],
            output: [0],
            count: 3
        },
        {
            name: "should skip given count (between one and two buffers)",
            input: [0, 1, 2, 3, 4],
            output: [0, 1, 2],
            count: 2
        },
        {
            name: "should skip given count (more than two buffers)",
            input: [0, 1, 2, 3, 4, 5, 6],
            output: [0, 1, 2, 3, 4],
            count: 2
        },
        {
            name: "should skip all when count equals length",
            input: [0, 1, 2, 3],
            output: [],
            count: 4
        },
        {
            name: "should skip all when count is more than length",
            input: [0, 1, 2, 3],
            output: [],
            count: 5
        },
        {
            name: "should handle empty list",
            input: [],
            output: [],
            count: 2
        }
    ];

    describe.each<TestCase>(testCases)("SkipLast", ({name, input, output, count}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).skipLast(count).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().skipLast(count).toArray()).toEqual(output);
        });
    });

    describe.each<TestCase>(testCases)("TakeLast", ({name, input, output, count}) => {
        output = input.slice(output.length);
        name = name.replace("skip", "take");

        it(`${name} synchronously`, () => {
            expect(from(input).takeLast(count).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().takeLast(count).toArray()).toEqual(output);
        });
    });
});
