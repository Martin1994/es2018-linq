import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<number>;
    readonly output: number[];
    readonly that: Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should return all elements except elements from that",
            input: [3, 0, 1, 2, 0, 0, 2],
            output: [3, 0],
            that: [1, 2, 2]
        },
        {
            name: "should exclude nothing when that is empty",
            input: [0, 2, 1, 0, 0, 2],
            output: [0, 2, 1],
            that: []
        },
        {
            name: "should return nothing when this is empty",
            input: [],
            output: [],
            that: [0, 1, 2]
        },
        {
            name: "should return nothing when both this and that are empty",
            input: [],
            output: [],
            that: []
        }
    ])("Except", ({name, input, output, that}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).except(that).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect((await from(input).asAsync().except(that).toArray())).toEqual(output);
        });
    });
});
