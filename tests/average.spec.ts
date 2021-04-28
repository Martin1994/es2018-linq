import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: number | Error;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should average with non-empty number iterables",
            input: [0, 1, 2, 3],
            output: 1.5
        },
        {
            name: "should handle empty case",
            input: [],
            output: new Error("Source contains no elements.")
        }
    ])("Average", ({name, input, output}) => {
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
                    return Promise.resolve(from(input).average());
                } catch (err) {
                    return Promise.reject(err);
                }
            });
        });

        it(`${name} asynchronously`, async () => {
            await validate(() => from(input).asAsync().average());
        });
    });
});
