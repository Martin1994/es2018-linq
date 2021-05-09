import { from } from "../src";
import { validate, validateSync } from "./utils/validate";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number | Error;
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
        it(`${name} synchronously`, async () => {
            await validateSync(() => from(input).average(), output);
        });

        it(`${name} asynchronously`, async () => {
            await validate(() => from(input).asAsync().average(), output);
        });
    });
});
