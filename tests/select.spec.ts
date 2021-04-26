import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<string>;
    selector: (x: number) => string;
}


describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should filter the iterable with elements satisfying specified criteria",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: ["0", "1", "2", "3", "4", "5", "6", "7", "10", "11"],
            selector: x => x.toString(8)
        }
    ])("Select", ({name, input, output, selector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).select(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous selector`, async () => {
            expect(await from(input).asAsync().select(selector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous selector`, async () => {
            expect(await from(input).asAsync().select(x => Promise.resolve(selector(x))).toArray()).toEqual(output);
        });
    });
});
