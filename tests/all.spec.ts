import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: boolean;
    readonly predicate: (x: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should be able to return true",
            input: [0, 0, 0, 0, 0],
            output: true,
            predicate: x => x === 0
        },
        {
            name: "should be able to return false",
            input: [0, 0, 0, 0, 1],
            output: false,
            predicate: x => x === 0
        },
        {
            name: "should be able to handle empty iterables",
            input: [],
            output: true,
            predicate: _ => false
        }
    ])("All", ({name, input, output, predicate}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).all(predicate)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous accumulator`, async () => {
            expect(await from(input).asAsync().all(predicate)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous accumulator`, async () => {
            expect(await from(input).asAsync().all(async (x) => Promise.resolve(predicate(x)))).toEqual(output);
        });
    });

    describe("All", () => {
        it("should iterate every element before the first occurrence but not iterate any element after it", () => {
            const fetched: number[] = [];
            function *generator() {
                for (let i = 0; i < 10; i++) {
                    fetched.push(i);
                    yield i;
                }
            }
            expect(from(generator()).all(x => x < 5)).toBeFalsy();
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
