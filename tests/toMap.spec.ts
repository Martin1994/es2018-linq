import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Map<string, number>;
    readonly keySelector: (x: number) => string;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should convert to map with duplicate keys",
            input: [0, 1, 2, 3, 1, 2, 3, 2, 3, 3],
            output: new Map([["0", 0], ["1", 1], ["2", 2], ["3", 3]]),
            keySelector: x => x.toString(10)
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: new Map(),
            keySelector: x => ""
        }
    ])("ToDictionary", ({name, input, output, keySelector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).toMap(keySelector)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous key selector`, async () => {
            expect(await from(input).asAsync().toMap(keySelector)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous key selector`, async () => {
            expect(await from(input).asAsync().toMap(x => Promise.resolve(keySelector(x)))).toEqual(output);
        });
    });
});
