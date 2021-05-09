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
            name: "should return min when there is exactly 1 element",
            input: [1],
            output: 1
        },
        {
            name: "should return min when there is more than 1 element",
            input: [1, -1, 0],
            output: -1
        },
        {
            name: "should throw when there is no element",
            input: [],
            output: new Error("Source contains no elements.")
        }
    ])("Min", ({name, input, output}) => {
        it(`${name} synchronously`, async () => {
            await validateSync(() => from(input).min(), output);
        });

        it(`${name} asynchronously`, async () => {
            await validate(() => from(input).asAsync().min(), output);
        });
    });
});
