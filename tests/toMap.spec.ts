import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Map<string, number>;
    readonly keySelector: (x: number) => string;
    readonly elementSelector?: (x: number) => number;
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
            name: "should convert to map with duplicate keys with elementSelector",
            input: [0, 1, 2, 3, 1, 2, 3, 2, 3, 3],
            output: new Map([["0", -0], ["1", -1], ["2", -2], ["3", -3]]),
            keySelector: x => x.toString(10),
            elementSelector: x => -x
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: new Map(),
            keySelector: x => ""
        }
    ])("ToDictionary", ({name, input, output, keySelector, elementSelector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).toMap(keySelector, elementSelector!)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous selectors`, async () => {
            expect(await from(input).asAsync().toMap(keySelector, elementSelector!)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous selectors`, async () => {
            if (elementSelector) {
                expect(await from(input).asAsync().toMap(x => Promise.resolve(keySelector(x)), x => Promise.resolve(elementSelector(x)))).toEqual(output);
            } else {
                expect(await from(input).asAsync().toMap(x => Promise.resolve(keySelector(x)))).toEqual(output);
            }
        });
    });
});
