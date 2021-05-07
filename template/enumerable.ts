import { AsyncEnumerable } from "./asyncEnumerable";

function* emptyGenerator() {
    // Yield nothing
}

export class Enumerable<T> implements Iterable<T> {

    private static readonly EMPTY_ENUMERABLE = new Enumerable<any>(emptyGenerator());

    protected readonly originalIterable: Iterable<T>;

    /**
     * @virtual
     */
    protected get iterable(): Iterable<T> {
        return this.originalIterable;
    }

    public constructor(iterable: Iterable<T>) {
        this.originalIterable = iterable;
    }

    public [Symbol.iterator](): Iterator<T> {
        return this.iterable[Symbol.iterator]();
    }

    public toArray(): T[] {
        return [...this.iterable];
    }

    public asAsync(): AsyncEnumerable<T> {
        return new AsyncEnumerable(this.asAsyncImpl());
    }

    private async *asAsyncImpl(): AsyncIterable<T> {
        for (const element of this.iterable) {
            yield element;
        }
    }

    public static empty<T>(): Enumerable<T> {
        return Enumerable.EMPTY_ENUMERABLE;
    }

    public static range(start: number, count: number): Enumerable<number> {
        return new Enumerable(function* (): Iterable<number> {
            for (let i = 0; i < count; i++) {
                yield start + i;
            }
        }());
    }

    public static repeat<T>(element: T, count: number): Enumerable<T> {
        return new Enumerable(function* (): Iterable<T> {
            for (let i = 0; i < count; i++) {
                yield element;
            }
        }());
    }
}

export class Grouping<TKey, TElement> extends Enumerable<TElement> {
    public readonly key: TKey;

    public constructor(key: TKey, iterable: Iterable<TElement>) {
        super(iterable);
        this.key = key;
    }
}

export class OrderedEnumerable<T> extends Enumerable<T> {
    public readonly comparer: (lhs: T, rhs: T) => number;

    public constructor(iterable: Iterable<T>, comparer: (lhs: T, rhs: T) => number) {
        super(iterable);
        this.comparer = comparer;
    }
}
