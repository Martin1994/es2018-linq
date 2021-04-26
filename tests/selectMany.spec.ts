import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    selector: (x: number) => Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should filter the iterable with elements satisfying specified criteria",
            input: [0, 1, 2, 3],
            output: [1, 2, 2, 3, 3, 3],
            selector: function* (x) {
                for (let i = 0; i < x; i++) {
                    yield x;
                }
            }
        }
    ])("SelectMany", ({name, input, output, selector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).selectMany(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous selector`, async () => {
            expect(await from(input).asAsync().selectMany(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous selector`, async () => {
            expect(await from(input).asAsync().selectMany(async function* (x) {
                yield* selector(x);
            }).toArray()).toEqual(output);
        });
    });
});
