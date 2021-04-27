import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: Iterable<any>;
    that: Iterable<number>;
    resultSelector?: (x: number, y: number) => any
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should zip when both have identical length without result selector",
            input: [0, 1, 2, 3],
            output: [[0, 0], [1, 10], [2, 20], [3, 30]],
            that: [0, 10, 20, 30]
        },
        {
            name: "should zip when both have identical length with result selector",
            input: [0, 1, 2, 3],
            output: [0, 11, 22, 33],
            that: [0, 10, 20, 30],
            resultSelector: (x, y) => x + y
        },
        {
            name: "should zip when this is longer",
            input: [0, 1, 2, 3],
            output: [0, 11, 22],
            that: [0, 10, 20],
            resultSelector: (x, y) => x + y
        },
        {
            name: "should zip when that is longer",
            input: [0, 1, 2],
            output: [0, 11, 22],
            that: [0, 10, 20, 30],
            resultSelector: (x, y) => x + y
        },
        {
            name: "should zip when this is empty",
            input: [],
            output: [],
            that: [0, 10, 20, 30],
            resultSelector: (x, y) => x + y
        },
        {
            name: "should zip when that is empty",
            input: [0, 1, 2, 3],
            output: [],
            that: [],
            resultSelector: (x, y) => x + y
        },
        {
            name: "should handle the case when both are empty",
            input: [],
            output: [],
            that: [],
            resultSelector: (x, y) => x + y
        }
    ])("Zip", ({name, input, output, that, resultSelector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).zip(that, resultSelector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous that${resultSelector ? " with synchronous result selector" : ""}`, async () => {
            expect(await from(input).asAsync().zip(that, resultSelector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous that${resultSelector ? " with synchronous result selector" : ""}`, async () => {
            expect(await from(input).asAsync().zip(from(that).asAsync(), resultSelector).toArray()).toEqual(output);
        });

        if (resultSelector) {
            it(`${name} asynchronously with synchronous that with asynchronous result selector`, async () => {
                expect(await from(input).asAsync().zip(that, (x, y) => Promise.resolve(resultSelector(x, y))).toArray()).toEqual(output);
            });
            it(`${name} asynchronously with asynchronous that with asynchronous result selector`, async () => {
                expect(await from(input).asAsync().zip(from(that).asAsync(), (x, y) => Promise.resolve(resultSelector(x, y))).toArray()).toEqual(output);
            });
        }
    });
});
