import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: number | undefined;
    predicate?: (x: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to return value",
            input: [1, 0, 0, 0, 0],
            output: 1,
            predicate: x => x === 1
        },
        {
            name: "should be able to return undefined",
            input: [0, 0, 0, 0, 0],
            output: undefined,
            predicate: x => x === 1
        },
        {
            name: "should be able to return value without predicate",
            input: [1],
            output: 1
        },
        {
            name: "should be able to return undefined without predicate",
            input: [],
            output: undefined
        },
        {
            name: "should be able to handle empty iterables",
            input: [],
            output: undefined,
            predicate: _ => true
        }
    ])("Last", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).last(predicate)).toEqual(output);
        });

        it(`${name} asynchronously${predicate ? "with synchronous accumulator" : ""}`, async () => {
            expect(await from(input).asAsync().last(predicate)).toEqual(output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous accumulator`, async () => {
                expect(await from(input).asAsync().last(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
            });
        }
    });
});
