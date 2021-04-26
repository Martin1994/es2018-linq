import { AsyncOrSync, AsyncOrSyncIterable } from "./asyncQueryable";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueryableImplementationTemplate<T> {

    private readonly iterable: AsyncIterable<T>;

    private constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable;
    }

    private async any(selector: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        for await (const element of this.iterable) {
            if (await selector(element)) {
                return true;
            }
        }
        return false;
    }

    private async *select<TResult>(selector: (element: T) => AsyncOrSync<TResult>): AsyncIterable<TResult> {
        for await (const element of this.iterable) {
            yield selector(element);
        }
    }

    private async *selectMany<TResult>(selector: (element: T) => AsyncOrSyncIterable<TResult>): AsyncIterable<TResult> {
        for await (const element of this.iterable) {
            for await (const subElement of selector(element)) {
                yield subElement;
            }
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
