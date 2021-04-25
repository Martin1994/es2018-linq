import { AsyncOrSyncIterable } from "./asyncQueryable";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueryableImplementationTemplate<T> {

    private readonly iterable: AsyncIterable<T>;

    private constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable;
    }

    private async *select(selector: (element: T) => boolean): AsyncIterable<T> {
        for await (const element of this.iterable) {
            if (selector(element)) {
                yield element;
            }
        }
    }

    private async *selectMany<TResult>(selector: (element: T) => AsyncOrSyncIterable<TResult>): AsyncIterable<TResult> {
        for await (const element of this.iterable) {
            for await (const subElement of selector(element)) {
                yield subElement;
            }
        }
    }

    private async any(selector: (element: T) => boolean): Promise<boolean> {
        for await (const element of this.iterable) {
            if (selector(element)) {
                return true;
            }
        }
        return false;
    }
}
