import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: boolean;
    readonly predicate?: (x: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to return true",
            input: [0, 0, 0, 0, 1],
            output: true,
            predicate: x => x === 1
        },
        {
            name: "should be able to return false",
            input: [0, 0, 0, 0, 0],
            output: false,
            predicate: x => x === 1
        },
        {
            name: "should be able to return true without predicate",
            input: [1],
            output: true
        },
        {
            name: "should be able to return false without predicate",
            input: [],
            output: false
        },
        {
            name: "should be able to handle empty iterables",
            input: [],
            output: false,
            predicate: _ => true
        }
    ])("Any", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).any(predicate!)).toEqual(output);
        });

        it(`${name} asynchronously${predicate ? "with synchronous accumulator" : ""}`, async () => {
            expect(await from(input).asAsync().any(predicate!)).toEqual(output);
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous accumulator`, async () => {
                expect(await from(input).asAsync().any(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
            });
        }
    });

    describe("Any", () => {
        it("should iterate every element before the first occurrence but not iterate any element after it", () => {
            const fetched: number[] = [];
            function *generator() {
                for (let i = 0; i < 10; i++) {
                    fetched.push(i);
                    yield i;
                }
            }
            expect(from(generator()).any(x => x >= 5)).toBeTruthy();
            for (let i = 0; i < 10; i++) {
                if (i < 5) {
                    expect(fetched).toContain(i);
                } else if (i > 5) {
                    expect(fetched).not.toContain(i);
                }
            }
        });
    });
});
