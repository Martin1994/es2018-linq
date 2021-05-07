import { from } from "../src";

interface TestCase {
    readonly name: string;
    readonly input: Iterable<string>;
    readonly output: string[];
    readonly descendingOutput: string[];
    readonly keySelector: (x: string) => string;
    readonly comparer?: (x: string, y: string) => number;
    readonly thenKeySelector: (x: string) => string;
    readonly thenComparer?: (x: string, y: string) => number;
}

describe("LINQ", () => {

    const testCases: TestCase[] = [
        {
            name: "should sort twice with comparer",
            input: ["-a", "-aaa", "-c", "-cc", "-b"],
            output: ["-a", "-b", "-c", "-cc", "-aaa"],
            descendingOutput: ["-c", "-b", "-a", "-cc", "-aaa"],
            keySelector: x => x.substr(1),
            comparer: (x, y) => x.length - y.length,
            thenKeySelector: x => x.substr(1),
            thenComparer: (x, y) => x < y ? -1 : x === y ? 0 : 1
        },
        {
            name: "should sort twice without comparer",
            input: ["-a", "-aaa", "-c", "-cc", "-b", "-aaa"],
            output: ["-a", "-b", "-c", "-cc", "-aaa", "-aaa"],
            descendingOutput: ["-c", "-b", "-a", "-cc", "-aaa", "-aaa"],
            keySelector: x => x.substr(1),
            comparer: (x, y) => x.length - y.length,
            thenKeySelector: x => x.substr(1)
        },
        {
            name: "should work with empty iterables",
            input: [],
            output: [],
            descendingOutput: [],
            keySelector: x => x.substr(1),
            comparer: (x, y) => x.length - y.length,
            thenKeySelector: x => x.substr(1),
            thenComparer: (x, y) => x < y ? -1 : x === y ? 0 : 1
        }
    ];

    describe.each<TestCase>(testCases)("ThenBy", ({name, input, output, descendingOutput, keySelector, comparer, thenKeySelector, thenComparer}) => {
        it(`${name} synchronously with OrderBy`, () => {
            expect(from(input).orderBy(keySelector, comparer).thenBy(thenKeySelector, thenComparer).toArray()).toEqual(output);
        });

        it(`${name} synchronously with OrderByDescending`, () => {
            expect(from(input).orderByDescending(keySelector, comparer).thenBy(thenKeySelector, thenComparer).toArray()).toEqual(descendingOutput.slice().reverse());
        });

        it(`${name} asynchronously${comparer && thenComparer ? "with synchronous comparer" : ""}`, async () => {
            expect(await from(input).asAsync().orderBy(keySelector, comparer).thenBy(thenKeySelector, thenComparer).toArray()).toEqual(output);
        });

        if (comparer && thenComparer) {
            it(`${name} asynchronously with asynchronous comparer`, async () => {
                expect(await from(input).asAsync().orderBy(keySelector, (x, y) => Promise.resolve(comparer(x, y))).thenBy(thenKeySelector, (x, y) => Promise.resolve(thenComparer(x, y))).toArray()).toEqual(output);
            });
        }
    });

    describe.each<TestCase>(testCases)("ThenByDescending", ({name, input, output, descendingOutput, keySelector, comparer, thenKeySelector, thenComparer}) => {
        it(`${name} synchronously with OrderBy`, () => {
            expect(from(input).orderBy(keySelector, comparer).thenByDescending(thenKeySelector, thenComparer).toArray()).toEqual(descendingOutput);
        });

        it(`${name} synchronously with OrderByDescending`, () => {
            expect(from(input).orderByDescending(keySelector, comparer).thenByDescending(thenKeySelector, thenComparer).toArray()).toEqual(output.slice().reverse());
        });

        it(`${name} asynchronously${comparer && thenComparer ? "with synchronous comparer" : ""}`, async () => {
            expect(await from(input).asAsync().orderBy(keySelector, comparer).thenByDescending(thenKeySelector, thenComparer).toArray()).toEqual(descendingOutput);
        });

        if (comparer && thenComparer) {
            it(`${name} asynchronously with asynchronous comparer`, async () => {
                expect(await from(input).asAsync().orderBy(keySelector, (x, y) => Promise.resolve(comparer(x, y))).thenByDescending(thenKeySelector, (x, y) => Promise.resolve(thenComparer(x, y))).toArray()).toEqual(descendingOutput);
            });
        }
    });

    describe("ThenBy", () => {
        it("should chain ThenBy", () => {
            expect(from(["000", "001", "010", "011", "100", "101", "110", "111"])
                .orderBy(s => s.charAt(2))
                .thenBy(s => s.charAt(1))
                .thenBy(s => s.charAt(0))
                .toArray()
            ).toEqual(["000", "100", "010", "110", "001", "101", "011", "111"]);
        });
    });
});
