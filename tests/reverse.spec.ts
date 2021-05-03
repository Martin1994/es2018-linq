import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should reverse iterables",
            input: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            output: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: []
        }
    ])("Reverse", ({name, input, output}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).reverse().toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().reverse().toArray()).toEqual(output);
        });
    });
});
