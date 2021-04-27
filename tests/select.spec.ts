import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<string>;
    selector: (x: number, i: number) => string;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should map iterables without index",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: ["0", "1", "2", "3", "4", "5", "6", "7", "10", "11"],
            selector: x => x.toString(8)
        },
        {
            name: "should map iterables with index",
            input: [0, 8, 64, 512],
            output: ["0 - 0", "10 - 1", "100 - 2", "1000 - 3"],
            selector: (x, i) => `${x.toString(8)} - ${i}`
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: [],
            selector: x => ""
        }
    ])("Select", ({name, input, output, selector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).select(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous selector`, async () => {
            expect(await from(input).asAsync().select(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous selector`, async () => {
            expect(await from(input).asAsync().select((x, i) => Promise.resolve(selector(x, i))).toArray()).toEqual(output);
        });
    });
});
