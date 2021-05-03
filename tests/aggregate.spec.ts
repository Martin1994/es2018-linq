import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: string;
    readonly seed: string;
    readonly func: (accumulate: string, x: number) => string;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should aggregate with non-empty iterable",
            input: [0, 1, 2, 3],
            output: "0123",
            seed: "",
            func: (accumulate, x) => accumulate + x.toString(10)
        },
        {
            name: "should aggregate with empty iterable",
            input: [],
            output: "seed",
            seed: "seed",
            func: (accumulate, x) => accumulate + x.toString(10)
        }
    ])("Aggregate", ({name, input, output, seed, func}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).aggregate(seed, func)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous accumulator`, async () => {
            expect(await from(input).asAsync().aggregate(seed, func)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous accumulator`, async () => {
            expect(await from(input).asAsync().aggregate(seed, async (a, x) => Promise.resolve(func(a, x)))).toEqual(output);
        });
    });
});
