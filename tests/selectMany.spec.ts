import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Iterable<number>;
    readonly selector: (x: number, i: number) => Iterable<number>;
    readonly resultSelector?: (x: number, y: number) => number;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should map and flatten the iterable without index",
            input: [0, 1, 2, 3],
            output: [1, 2, 2, 3, 3, 3],
            selector: function* (x) {
                for (let i = 0; i < x; i++) {
                    yield x;
                }
            }
        },
        {
            name: "should map and flatten the iterable without index",
            input: [0, 1, 2, 3],
            output: [-1, 2, 2, -3, -3, -3],
            selector: function* (x, i) {
                for (let j = 0; j < x; j++) {
                    yield x * ((i % 2) - 0.5) * -2;
                }
            }
        },
        {
            name: "should map and flatten the iterable with result selector",
            input: [0, 1, 2, 3],
            output: [0, 0, 2, 0, 3, 6],
            selector: function* (x) {
                for (let i = 0; i < x; i++) {
                    yield i;
                }
            },
            resultSelector: (x, y) => x * y
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: [],
            selector: _ => [1, 1, 1]
        }
    ])("SelectMany", ({name, input, output, selector, resultSelector}) => {
        it(`${name} synchronously`, () => {
            if (resultSelector) {
                expect(from(input).selectMany(selector, resultSelector).toArray()).toEqual(output);
            } else {
                expect(from(input).selectMany(selector).toArray()).toEqual(output);
            }
        });

        it(`${name} asynchronously with synchronous selector`, async () => {
            if (resultSelector) {
                expect(await from(input).asAsync().selectMany(selector, resultSelector).toArray()).toEqual(output);
            } else {
                expect(await from(input).asAsync().selectMany(selector).toArray()).toEqual(output);
            }
        });

        it(`${name} asynchronously with asynchronous selector`, async () => {
            if (resultSelector) {
                expect(await from(input).asAsync().selectMany(async function* (x, i) {
                    yield* selector(x, i);
                }, (x, y) => Promise.resolve(resultSelector(x, y))).toArray()).toEqual(output);
            } else {
                expect(await from(input).asAsync().selectMany(async function* (x, i) {
                    yield* selector(x, i);
                }).toArray()).toEqual(output);
            }
        });
    });
});
