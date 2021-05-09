import { from } from "../src";
import { validate, validateSync } from "./utils/validate";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number | undefined;
    readonly predicate?: (x: number) => boolean;
}

const testCases: TestCase[] = [
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
];

describe("LINQ", () => {
    describe.each<TestCase>(testCases)("Last", ({name, input, output, predicate}) => {

        it(`${name} synchronously`, async () => {
            await validateSync(() => from(input).last(predicate!), output);
        });

        it(`${name} asynchronously${predicate ? " with synchronous predicate" : ""}`, async () => {
            await validate(() => from(input).asAsync().last(predicate!), output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous predicate`, async () => {
                await validate(() => from(input).asAsync().last(async (x) => Promise.resolve(predicate(x))), output);
            });
        }
    });

    describe.each<TestCase>(testCases)("LastOrDefault", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).lastOrUndefined(predicate!)).toEqual(output);
        });

        it(`${name} asynchronously${predicate ? "with synchronous accumulator" : ""}`, async () => {
            expect(await from(input).asAsync().lastOrUndefined(predicate!)).toEqual(output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous accumulator`, async () => {
                expect(await from(input).asAsync().lastOrUndefined(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
            });
        }
    });
});
