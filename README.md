# ESLINQ - LINQ for ES2018+

## Abstract

This library provides a set of functional programming APIs copied from [LINQ](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/) from the .NET world. These predefined functional programming APIs allows you to manipulate an [Iterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (available since ES2015) or an [AsyncIterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) (available since ES2018) in an easy and maintainable shape.

This library attempts to provide exact the same API defined in [Queryable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.queryable) of .NET with TypeScript types. On top of that, its attempts to provide consistent API experience between synchronous and asynchronous operations by leveraging TypeScript code generation.

## Usage

Since this library is a ES2018 port of LINQ from .NET, please refer to [System.Linq.Queryable API documentation](https://docs.microsoft.com/en-us/dotnet/api/system.linq.queryable) as a detailed API reference.

### Starting using LINQ

```javascript
import { from } from "es-linq";

console.log(
    from([-1, 0, 1, 2])
        .where(x => x > 0)
        .select(x => x * 2)
        .toArray()
);

// Output: [2, 4]
```

### Create LINQ object from an iterable

```javascript
const myIterable = ["some", "value"];
const queryable = from(myIterable);

async function* myAsyncGenerator() {
    yield await asyncOperationA();
    yield await asyncOperationB();
}
const asyncQueryable = from(myAsyncGenerator());
```

### Iterate with a LINQ object

```javascript
const myInput = [0, 1, 2, 3];
const queryable = from(myInput).where(x => x % 2 === 0);
for (const x of queryable) {
    console.log(x);
}
// Output: 0, 2

console.log(queryable.toArray());
// Output: [0, 2]
```

### Work with an asynchronous iterable

```javascript
async function* asyncGenerator() {
    yield* [0, 1, 2, 3];
}
const asyncQueryable = from(asyncGenerator());

// It accepts both synchronous and asynchronous functions
console.log(await asyncQueryable.any(x => x === 2)); // Output: true
console.log(await asyncQueryable.any(x => Promise.resolve(x === 2))); // Output: true
```

### Convert a synchronous LINQ object to asynchronous

```javascript
const queryable = from(["John", "Smith"]);
const asyncQueryable = queryable.asAsync();

// Then it accepts asynchronous functions
const allPresent = await asyncQueryable.all(async x => await queryPresentAsync(x));
```

## Development guide

### Get started

```shell
# Compile
npm run build

# Test
npm test
```

### File structure

- `codegen` directory contains the source code for code generation.
- `template` directory contains the template code for code generation.
    - `asyncQueryable.ts` and `queryable.ts` are the empty template classes. Their content will be copied as is.
    - `implementationTemplate.ts` contains implementation methods. Each of the implementation method will be added into the above two classes. Contents other than the implementation methods is not used in code generation.
- `src` directory contains source code, including both generated and non-generated ones.
- `lib` directory contains compiled code, type definitions and source maps.
- `tests` directory contains unit tests.

### How code generation works

The goal of code generation here is to generate both synchronous and asynchronous implementation methods from one single source.

The strategy here is to write code template with valid TypeScript, and then use TypeScript compiler API to stitch implementation methods into the two output classes with necessary modification. This stitching operation is done at AST level.

For example, a template implementation method, its generated asynchronous method and generated synchronous method will look like the following:

```typescript
// Template implementation template class
class QueryableImplementationTemplate<T> {
    private async *where(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}

// Generated asynchronous class
class AsyncQueryable<T> {
    // A wrapper method will be generated
    public const(predicate: (element: T) => AsyncOrSync<boolean>): AsyncQueryable<T> {
        return new AsyncQueryable(this.constImpl(predicate));
    }

    // The template method will have a prefix "Impl" in its name
    private async *constImpl(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        // Method body will be kept as is
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}

// Generated synchronous class
class Queryable<T> {
    // A wrapper method will be generated
    // Asynchronous types will be removed from its signature or turned into its synchronous alternative
    public const(predicate: (element: T) => boolean): Queryable<T> {
        return new Queryable(this.constImpl(predicate));
    }

    // The template method will have a prefix "Impl" in its name
    // Asynchronous types will be removed from its signature or turned into its synchronous alternative
    private *constImpl(predicate: (element: T) => boolean): Iterable<T> {
        // Method body will *almost* be kept as is, except await keywords will be removed.
        for (const element of this.iterable) {
            if (predicate(element)) {
                yield element;
            }
        }
    }
}
```

## Prior art
* https://github.com/balazsbotond/eslinq
