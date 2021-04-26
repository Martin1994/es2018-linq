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
            name: "should append to a non-empty iterable",
            input: [0, 1, 2, 3],
            output: [0, 1, 2, 3, 4],
            element: 4
        },
        {
            name: "should append to an empty iterable",
            input: [],
            output: [0],
            element: 0
        }
    ])("Append", ({name, input, output, element}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).append(element).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().append(element).toArray()).toEqual(output);
        });
    });
});
