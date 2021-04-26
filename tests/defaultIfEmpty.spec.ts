import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<number>;
    defaultValue: number;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should not add default value if input is non-empty",
            input: [1, 1, 1],
            output: [1, 1, 1],
            defaultValue: 0
        },
        {
            name: "should add default value if input is empty",
            input: [],
            output: [0],
            defaultValue: 0
        }
    ])("DefaultIfEmpty", ({name, input, output, defaultValue}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).defaultIfEmpty(defaultValue).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().defaultIfEmpty(defaultValue).toArray()).toEqual(output);
        });
    });
});
