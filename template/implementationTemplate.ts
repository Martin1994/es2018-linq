import { AsyncOrSync, AsyncOrSyncIterable } from "./asyncEnumerable";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EnumerableImplementationTemplate<T> {

    private readonly iterable: AsyncIterable<T>;

    private readonly toArray: () => Promise<T[]> = () => Promise.resolve([]);

    private constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable;
    }

    private async aggregate<TAccumulate>(
        seed: TAccumulate,
        func: (accumulate: TAccumulate, element: T) => AsyncOrSync<TAccumulate>
    ): Promise<TAccumulate> {
        let accumulate = seed;
        for await (const element of this.iterable) {
            accumulate = await func(accumulate, element);
        }

        return accumulate;
    }

    private async all(predicate: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        for await (const element of this.iterable) {
            if (!await predicate(element)) {
                return false;
            }
        }
        return true;
    }

    private async any(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        if (!predicate) {
            predicate = _ => true;
        }

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                return true;
            }
        }
        return false;
    }

    private async *append(element: T): AsyncIterable<T> {
        yield* this.iterable;
        yield element;
    }

    private async *concat(secondHalf: AsyncOrSyncIterable<T>): AsyncIterable<T> {
        yield* this.iterable;
        yield* secondHalf;
    }

    private async contains(value: T, comparer?: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean> {
        if (!comparer) {
            comparer = (lhs, rhs) => lhs === rhs;
        }

        for await (const element of this.iterable) {
            if (await comparer(element, value)) {
                return true;
            }
        }
        return false;
    }

    private async count(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<number> {
        if (!predicate) {
            predicate = _ => true;
        }

        let counter = 0;
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                counter++;
            }
        }
        return counter;
    }

    private async *defaultIfEmpty(defaultValue: T): AsyncIterable<T> {
        let empty = true;
        for await (const element of this.iterable) {
            empty = false;
            yield element;
        }

        if (empty) {
            yield defaultValue;
        }
    }

    private async *distinct(comparer?: (lhs: T, rhs: T) => number): AsyncIterable<T> {
        if (comparer) {
            const sorted = (await this.toArray()).sort(comparer);

            for (let i = 0; i < sorted.length; i++) {
                if (i === 0  || comparer(sorted[i - 1], sorted[i]) !== 0) {
                    yield sorted[i];
                }
            }
        } else {
            yield* new Set(await this.toArray());
        }
    }

    private async elementAt(index: number): Promise<T | undefined> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i === index) {
                return element;
            }
            i++;
        }
        return undefined;
    }

    private async *select<TResult>(selector: (element: T) => AsyncOrSync<TResult>): AsyncIterable<TResult> {
        for await (const element of this.iterable) {
            yield selector(element);
        }
    }

    private async *selectMany<TResult>(selector: (element: T) => AsyncOrSyncIterable<TResult>): AsyncIterable<TResult> {
        for await (const element of this.iterable) {
            yield* selector(element);
        }
    }

    private async *where(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}
