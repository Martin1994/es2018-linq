import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output?: number;
    readonly index: number;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return element at middle",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: 5,
            index: 5
        },
        {
            name: "should return element at the beginning",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: 0,
            index: 0
        },
        {
            name: "should return element at the end",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: 9,
            index: 9
        },
        {
            name: "should return undefined when out of range",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: undefined,
            index: 10
        },
        {
            name: "should return undefined input is empty",
            input: [],
            output: undefined,
            index: 0
        }
    ])("ElementAt", ({name, input, output, index}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).elementAt(index)).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().elementAt(index)).toEqual(output);
        });
    });
});
