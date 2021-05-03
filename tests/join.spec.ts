import { from } from "../src";

class Owner {
    public readonly name: string;
    public readonly id: number;
    public constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}

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
    readonly input: Iterable<Owner>;
    readonly output: Iterable<string>;
    readonly inner: Iterable<Pet>;
    readonly innerKeySelector: (x: Pet) => string;
    readonly outerKeySelector: (x: Owner) => string;
    readonly resultSelector: (x: Owner, y: Pet) => string
}

describe("LINQ", () => {
    describe.each<TestCase>([
        {
            name: "should join when all element matches exactly once",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1)],
            output: ["0: a", "2: c", "1: b"],
            inner: [new Pet("a", "A"), new Pet("b", "B"), new Pet("c", "C")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when inner has more keys",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1)],
            output: ["0: a", "2: c", "1: b"],
            inner: [new Pet("a", "A"), new Pet("b", "B"), new Pet("c", "C"), new Pet("d", "D")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when inner has duplicate keys",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1)],
            output: ["0: a", "2: c", "1: b2", "1: b1"],
            inner: [new Pet("a", "A"), new Pet("b2", "B"), new Pet("c", "C"), new Pet("b1", "B")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when outer has more keys",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1), new Owner("D", 3)],
            output: ["0: a", "2: c", "1: b"],
            inner: [new Pet("a", "A"), new Pet("b", "B"), new Pet("c", "C")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when outer has duplicate keys",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1), new Owner("C", -2)],
            output: ["0: a", "2: c", "1: b", "-2: c"],
            inner: [new Pet("a", "A"), new Pet("b", "B"), new Pet("c", "C")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when inner is empty",
            input: [new Owner("A", 0), new Owner("C", 2), new Owner("B", 1)],
            output: [],
            inner: [],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when outer is empty",
            input: [],
            output: [],
            inner: [new Pet("a", "A"), new Pet("b", "B"), new Pet("c", "C")],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        },
        {
            name: "should join when both inner and outer are empty",
            input: [],
            output: [],
            inner: [],
            innerKeySelector: x => x.owner,
            outerKeySelector: x => x.name,
            resultSelector: (x, y) => `${x.id}: ${y.name}`
        }
    ])("Join", ({name, input, output, inner, outerKeySelector, innerKeySelector, resultSelector}) => {
        it(`${name} synchronously`, () => {
            expect(from(input).join(inner, outerKeySelector, innerKeySelector, resultSelector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous inner and synchronous selectors`, async () => {
            expect(await from(input).asAsync().join(inner, outerKeySelector, innerKeySelector, resultSelector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous inner and synchronous selectors`, async () => {
            expect(await from(input).asAsync().join(from(inner).asAsync(), outerKeySelector, innerKeySelector, resultSelector).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with synchronous inner and asynchronous selectors`, async () => {
            expect(await from(input).asAsync().join(
                inner,
                x => Promise.resolve(outerKeySelector(x)),
                x => Promise.resolve(innerKeySelector(x)),
                (x, y) => Promise.resolve(resultSelector(x, y))
            ).toArray()).toEqual(output);
        });

        it(`${name} asynchronously with asynchronous inner and asynchronous selectors`, async () => {
            expect(await from(input).asAsync().join(
                from(inner).asAsync(),
                x => Promise.resolve(outerKeySelector(x)),
                x => Promise.resolve(innerKeySelector(x)),
                (x, y) => Promise.resolve(resultSelector(x, y))
            ).toArray()).toEqual(output);
        });
    });
});
