import { from } from "../src";

describe("LINQ", () => {
    describe("Miscellaneous", () => {
        it("should be iterable", () => {
            const input = [0, 1, 2, 3];
            const output = [...from(input)];
            expect(output).toEqual(input);
        });

        it("should be async iterable", async () => {
            const input = [0, 1, 2, 3];
            async function* generator() {
                yield* input;
            }
            const output = from(generator());

            let i = 0;
            for await (const x of output) {
                expect(x).toBe(input[i]);
                i++;
            }
        });

        it("can be converted to an array", () => {
            const input = [0, 1, 2, 3];
            const output = from(input).toArray();
            expect(output).toEqual(input);
        });

        it("can be converted to an array asynchronously", async () => {
            const input = [0, 1, 2, 3];
            async function* generator() {
                yield* input;
            }
            const output = await from(generator()).toArray();

            expect(output).toEqual(input);
        });
    });
});
