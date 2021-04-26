import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    predicate: (x: number) => boolean;
}


describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should filter the iterable with elements satisfying specified criteria",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: [0, 2, 4, 6, 8],
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
            expect(await from(input).asAsync().where(x => Promise.resolve(predicate(x))).toArray()).toEqual(output);
        });
    });
});
