import { from } from "../src";
import { Grouping } from "../src/enumerable";

class Pet {
    public readonly name: string;
    public readonly owner: string;
    public constructor(name: string, owner: string) {
        this.name = name;
        this.owner = owner;
    }
}

interface TestCase {
    readonly name: string;
    readonly input: Iterable<Pet>;
    readonly output: Iterable<string>;
    readonly keySelector: (x: Pet) => string;
    readonly elementSelector?: (x: Pet) => string;
    readonly resultSelector?: (x: string, y: Iterable<string>) => string
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should group by keys with element selector and result selector",
            input: [new Pet("b", "B"), new Pet("a2", "A"), new Pet("b", "B"), new Pet("a1", "A")],
            output: ["B:b,b", "A:a2,a1"],
            keySelector: x => x.owner,
            elementSelector: x => x.name,
            resultSelector: (x, y) => `${x}:${[...y].join(",")}`
        },
        {
            name: "should group by keys with element selector but without result selector",
            input: [new Pet("b", "B"), new Pet("a2", "A"), new Pet("b", "B"), new Pet("a1", "A")],
            output: ["{B:b,b}", "{A:a2,a1}"],
            keySelector: x => x.owner,
            elementSelector: x => x.name,
        },
        {
            name: "should group by keys with element selector but without result selector",
            input: [new Pet("b", "B"), new Pet("a2", "A"), new Pet("b", "B"), new Pet("a1", "A")],
            output: ["{B:{b},{b}}", "{A:{a2},{a1}}"],
            keySelector: x => x.owner
        },
        {
            name: "should handle empty input",
            input: [],
            output: [],
            keySelector: x => x.owner,
            elementSelector: x => x.name,
            resultSelector: (x, y) => `${x}:${[...y].join(",")}`
        }
    ])("GroupBy", ({name, input, output, keySelector, elementSelector, resultSelector}) => {

        const asyncKeySelector = (x: Pet) => Promise.resolve(keySelector(x));
        const asyncElementSelector = elementSelector ? (x: Pet) => Promise.resolve(elementSelector(x)) : undefined;
        const asyncResultSelector = resultSelector ? (x: string, y: Iterable<string>) => Promise.resolve(resultSelector(x, y)) : undefined;

        const mapper = (x: string | Grouping<string, Pet | string>): string => {
            if (typeof(x) === "string") {
                return x;
            }

            const values = x.select(v => typeof(v) === "string" ? v : `{${v.name}}`).toArray().join(",");
            return `{${x.key}:${values}}`;
        };

        it(`${name} synchronously`, () => {
            expect(from(input).groupBy(keySelector, elementSelector, resultSelector).toArray().map(mapper)).toEqual(output);
        });

        it(`${name} asynchronously with synchronous selectors`, async () => {
            expect((await from(input).asAsync().groupBy(keySelector, elementSelector, resultSelector).toArray()).map(mapper)).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous selectors`, async () => {
            expect((await from(input).asAsync().groupBy(asyncKeySelector, asyncElementSelector, asyncResultSelector).toArray()).map(mapper)).toEqual(output);
        });
    });
});
