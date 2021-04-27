import { from } from "../src";

export interface TestCase {
    name: string;
    input: number[];
    output: number[];
    predicate: (x: number, i: number) => boolean;
}

describe("LINQ", () => {
    const testCases: TestCase[] = [
        {
            name: "should skip by predicate without using index",
            input: [0, 1, 2, 3],
            output: [2, 3],
            predicate: x => x < 2
        },
        {
            name: "should skip by predicate with using index",
            input: [0, 1, 2, 3],
            output: [3],
            predicate: (x, i) => i < 3
        },
        {
            name: "should skip everything if predicate always returns true",
            input: [0, 1, 2, 3],
            output: [],
            predicate: x => true
        },
        {
            name: "should skip nothing if predicate always returns false",
            input: [0, 1, 2, 3],
            output: [0, 1, 2, 3],
            predicate: x => false
        },
        {
            name: "should handle empty input",
            input: [],
            output: [],
            predicate: x => false
        }
    ];

    describe.each<TestCase>(testCases)("SkipWhile", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).skipWhile(predicate).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().skipWhile(predicate).toArray()).toEqual(output);
        });
    });

    describe.each<TestCase>(testCases)("TakeWhile", ({name, input, output, predicate}) => {
        output = output.length === 0 ? input : input.slice(0, -output.length);
        name = name.replace("skip", "take");

        it(`${name} synchronously`, () => {
            expect(from(input).takeWhile(predicate).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect(await from(input).asAsync().takeWhile(predicate).toArray()).toEqual(output);
        });
    });
});
