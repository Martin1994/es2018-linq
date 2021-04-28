import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: number | Error;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return min when there is exactly 1 element",
            input: [1],
            output: 1
        },
        {
            name: "should return min when there is more than 1 element",
            input: [-1, 1, 0],
            output: 1
        },
        {
            name: "should throw when there is no element",
            input: [],
            output: new Error("Source contains no elements.")
        }
    ])("Max", ({name, input, output}) => {
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
                    return Promise.resolve(from(input).max());
                } catch (err) {
                    return Promise.reject(err);
                }
            });
        });

        it(`${name} asynchronously`, async () => {
            await validate(() => from(input).asAsync().max());
        });
    });
});
