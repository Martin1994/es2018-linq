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
            name: "should intersects elements from that",
            input: [3, 0, 2, 1, 0, 0, 2],
            output: [2, 1],
            that: [1, 2, 2]
        },
        {
            name: "should return nothing when that is empty",
            input: [0, 2, 1, 0, 0, 2],
            output: [],
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
    ])("Intersect", ({name, input, output, that}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).intersect(that).toArray()).toEqual(output);
        });

        it(`${name} asynchronously`, async () => {
            expect((await from(input).asAsync().intersect(that).toArray())).toEqual(output);
        });
    });
});
