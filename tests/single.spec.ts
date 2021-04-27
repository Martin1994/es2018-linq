import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number | undefined>;
    output: number | undefined | Error;
    predicate?: (x?: number) => boolean;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return true when there is exactly one element",
            input: [0],
            output: 0
        },
        {
            name: "should return true when there is exactly one element and is undefined",
            input: [undefined],
            output: undefined
        },
        {
            name: "should return true when there is exactly one matching element",
            input: [0, 1, 0],
            output: 1,
            predicate: x => x === 1
        },
        {
            name: "should return true when there is exactly one matching element and is undefined",
            input: [1, undefined, 1],
            output: undefined,
            predicate: x => !x
        },
        {
            name: "should return false when there are multiple elements",
            input: [0, 1],
            output: new Error("More than one element is found.")
        },
        {
            name: "should return false when there are multiple matching elements",
            input: [0, 1, 0, 1],
            output: new Error("More than one element is found."),
            predicate: x => x === 1
        },
        {
            name: "should return false when there is no elements",
            input: [],
            output: new Error("No element is found.")
        },
        {
            name: "should return false when there is no matching elements",
            input: [0, 0, 0],
            output: new Error("No element is found."),
            predicate: x => x === 1
        },
        {
            name: "should return false with predicate when there is no elements",
            input: [],
            output: new Error("No element is found."),
            predicate: x => true
        }
    ])("Single", ({name, input, output, predicate}) => {
        async function validate(action: () => Promise<any>) {
            if (output instanceof Error) {
                await expect(action()).rejects.toThrow(output);
            } else {
                await expect(action()).resolves.toEqual(output);
            }
        }

        it(`${name} synchronously`, async () => {
            await validate((): Promise<any> => {
                try {
                    return Promise.resolve(from(input).single(predicate));
                } catch (err) {
                    return Promise.reject(err);
                }
            });
        });

        it(`${name} asynchronously${predicate ? " with synchronous predicate" : ""}`, async () => {
            await validate(() => from(input).asAsync().single(predicate));
        });

        if (predicate) {
            it(`${name} asynchronously with asynchronous predicate`, async () => {
                await validate(() => from(input).asAsync().single(async (x) => Promise.resolve(predicate(x))));
            });
        }
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
