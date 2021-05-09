import { from } from "../src";
import { validateSyncWithUndefined, validateWithUndefined } from "./utils/validate";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number | undefined>;
    readonly output: number | undefined | Error;
    readonly predicate?: (x?: number) => boolean;
}

const testCases: TestCase[] = [
    {
        name: "should return true when there is exactly one element",
        input: [0],
        output: 0
    },
    {
        name: "should return true when there is exactly one element and is undefined",
        input: [undefined],
        output: undefined
    },
    {
        name: "should return true when there is exactly one matching element",
        input: [0, 1, 0],
        output: 1,
        predicate: x => x === 1
    },
    {
        name: "should return true when there is exactly one matching element and is undefined",
        input: [1, undefined, 1],
        output: undefined,
        predicate: x => !x
    },
    {
        name: "should return false when there are multiple elements",
        input: [0, 1],
        output: new Error("More than one element is found.")
    },
    {
        name: "should return false when there are multiple matching elements",
        input: [0, 1, 0, 1],
        output: new Error("More than one element is found."),
        predicate: x => x === 1
    },
    {
        name: "should return false when there is no elements",
        input: [],
        output: new Error("No element is found.")
    },
    {
        name: "should return false when there is no matching elements",
        input: [0, 0, 0],
        output: new Error("No element is found."),
        predicate: x => x === 1
    },
    {
        name: "should return false with predicate when there is no elements",
        input: [],
        output: new Error("No element is found."),
        predicate: x => true
    }
];

describe("LINQ", () => {
    describe.each<TestCase>(testCases)("Single", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, async () => {
            await validateSyncWithUndefined(() => from(input).single(predicate!), output);
        });

        it(`${name} asynchronously${predicate ? " with synchronous predicate" : ""}`, async () => {
            await validateWithUndefined(() => from(input).asAsync().single(predicate!), output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous predicate`, async () => {
                await validateWithUndefined(() => from(input).asAsync().single(async (x) => Promise.resolve(predicate(x))), output);
            });
        }
    });

    describe.each<TestCase>(testCases)("SingleOrDefault", ({name, input, output, predicate}) => {
        if (output instanceof Error && output.message === "No element is found.") {
            output = undefined;
        }

        it(`${name} synchronously`, async () => {
            await validateSyncWithUndefined(() => from(input).singleOrUndefined(predicate!), output);
        });

        it(`${name} asynchronously${predicate ? " with synchronous predicate" : ""}`, async () => {
            await validateWithUndefined(() => from(input).asAsync().singleOrUndefined(predicate!), output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous predicate`, async () => {
                await validateWithUndefined(() => from(input).asAsync().singleOrUndefined(async (x) => Promise.resolve(predicate(x))), output);
            });
        }
    });
});
