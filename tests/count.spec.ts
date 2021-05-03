import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number;
    readonly predicate?: (x: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to count non-empty iterables",
            input: [0, 1, 2],
            output: 2,
            predicate: x => x > 0
        },
        {
            name: "should be able to count empty iterables",
            input: [],
            output: 0,
            predicate: x => true
        },
        {
            name: "should be able to count non-empty iterables without predicate",
            input: [0, 1, 2],
            output: 3
        },
        {
            name: "should be able to count empty iterables without predicate",
            input: [],
            output: 0
        }
    ])("Count", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).count(predicate)).toEqual(output);
        });

        it(`${name} asynchronously${predicate ? "with synchronous predicate" : ""}`, async () => {
            expect(await from(input).asAsync().count(predicate)).toEqual(output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous predicate`, async () => {
                expect(await from(input).asAsync().count(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
            });
        }
    });
});
