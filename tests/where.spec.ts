import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Iterable<number>;
    readonly predicate: (x: number, i: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should filter the iterable with elements satisfying specified criteria",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: [0, 2, 4, 6, 8],
            predicate: x => x % 2 === 0
        },
        {
            name: "should filter the iterable with elements satisfying specified criteria using index",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: [0, 2, 4],
            predicate: (x, i) => x % 2 === 0 && i < 5
        },
        {
            name: "should handle empty input",
            input: [],
            output: [],
            predicate: x => x % 2 === 0
        }
    ])("Where", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).where(predicate).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous predicate`, async () => {
            expect(await from(input).asAsync().where(predicate).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous predicate`, async () => {
            expect(await from(input).asAsync().where((x, i) => Promise.resolve(predicate(x, i))).toArray()).toEqual(output);
        });
    });
});
