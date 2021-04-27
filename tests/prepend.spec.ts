import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    element: number;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should prepend to a non-empty iterable",
            input: [0, 1, 2, 3],
            output: [4, 0, 1, 2, 3],
            element: 4
        },
        {
            name: "should prepend to an empty iterable",
            input: [],
            output: [0],
            element: 0
        }
    ])("Prepend", ({name, input, output, element}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).prepend(element).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().prepend(element).toArray()).toEqual(output);
        });
    });
});
