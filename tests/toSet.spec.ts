import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Set<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should convert to map with duplicate keys",
            input: [0, 1, 2, 3, 1, 2, 3, 2, 3, 3],
            output: new Set([0, 1, 2, 3]),
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: new Set(),
        }
    ])("ToHashSet", ({name, input, output}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).toSet()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().toSet()).toEqual(output);
        });
    });
});
