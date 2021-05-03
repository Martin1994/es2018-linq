import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number | undefined;
    readonly predicate?: (x: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to return value",
            input: [0, 0, 0, 0, 1],
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
    ])("First", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).first(predicate)).toEqual(output);
        });

        it(`${name} asynchronously${predicate ? "with synchronous accumulator" : ""}`, async () => {
            expect(await from(input).asAsync().first(predicate)).toEqual(output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous accumulator`, async () => {
                expect(await from(input).asAsync().first(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
            });
        }
    });
});
