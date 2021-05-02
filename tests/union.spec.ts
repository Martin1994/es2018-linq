import { from } from "../src";

export interface TestCase {
    name: string;
    input: Iterable<number>;
    output: number[];
    that: Iterable<number>;
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should union elements from that",
            input: [3, 0, 2, 1, 0, 0, 2],
            output: [3, 0, 2, 1, -1],
            that: [1, 2, -1, 2]
        },
        {
            name: "should return this.distinct() when that is empty",
            input: [0, 2, 1, 0, 0, 2],
            output: [0, 2, 1],
            that: []
        },
        {
            name: "should return that.distinct() when this is empty",
            input: [],
            output: [0, 2, 1],
            that: [0, 2, 1, 0, 0, 2]
        },
        {
            name: "should return nothing when both this and that are empty",
            input: [],
            output: [],
            that: []
        }
    ])("Union", ({name, input, output, that}) => {
        output.sort();

        it(`${name} synchronously`, () => {
            expect(from(input).union(that).toArray().sort()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect((await from(input).asAsync().union(that).toArray()).sort()).toEqual(output);
        });
    });
});
