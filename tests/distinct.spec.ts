import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return distinct elements with more than 1 elements",
            input: [0, 3, 1, 2, 0, 0, 2],
            output: [0, 3, 1, 2]
        },
        {
            name: "should return distinct elements with 1 element",
            input: [0],
            output: [0]
        },
        {
            name: "should return distinct elements with 0 elements",
            input: [],
            output: []
        }
    ])("Distinct", ({name, input, output}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).distinct().toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().distinct().toArray()).toEqual(output);
        });
    });
});
