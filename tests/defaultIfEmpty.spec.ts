import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: Iterable<number>;
    readonly undefinedOutput: Iterable<number | undefined>;
    readonly defaultValue: number;
}

const DEFAULT: number = 0;

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should not add default value if input is non-empty",
            input: [1, 1, 1],
            output: [1, 1, 1],
            undefinedOutput: [1, 1, 1],
            defaultValue: DEFAULT
        },
        {
            name: "should add default value if input is empty",
            input: [],
            output: [0],
            undefinedOutput: [undefined],
            defaultValue: DEFAULT
        }
    ])("DefaultIfEmpty", ({name, input, output, undefinedOutput, defaultValue}) => {
        it(`${name} synchronously with default value`, () => {
            expect(from(input).defaultIfEmpty(defaultValue).toArray()).toEqual(output);
        });

        it(`${name} synchronously without default value`, () => {
            expect(from(input).undefinedIfEmpty().toArray()).toEqual(undefinedOutput);
        });

        it(`${name} asynchronously with default value`, async () => {
            expect(await from(input).asAsync().defaultIfEmpty(defaultValue).toArray()).toEqual(output);
        });

        it(`${name} asynchronously without default value`, async () => {
            expect(await from(input).asAsync().undefinedIfEmpty().toArray()).toEqual(undefinedOutput);
        });
    });
});
