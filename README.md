# ESLINQ - LINQ for ES2018+

## Abstract

This library provides a set of functional programming APIs copied from [LINQ](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/) from the .NET world. These predefined functional programming APIs allows you to manipulate an [Iterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (available since ES2015) or an [AsyncIterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) (available since ES2018) in an easy and maintainable shape.

This library attempts to provide exact the same API defined in [Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable) of .NET with TypeScript types. On top of that, its attempts to provide consistent API experience between synchronous and asynchronous operations by leveraging TypeScript code generation.

## Usage

Since this library is a ES2018 port of LINQ from .NET, please refer to [System.Linq.Enumerable API documentation](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable) as a detailed API reference.

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
const enumerable = from(myIterable);

async function* myAsyncGenerator() {
    yield await asyncOperationA();
    yield await asyncOperationB();
}
const asyncEnumerable = from(myAsyncGenerator());
```

### Iterate with a LINQ object

```javascript
const myInput = [0, 1, 2, 3];
const enumerable = from(myInput).where(x => x % 2 === 0);
for (const x of enumerable) {
    console.log(x);
}
// Output: 0, 2

console.log(enumerable.toArray());
// Output: [0, 2]
```

### Work with an asynchronous iterable

```javascript
async function* asyncGenerator() {
    yield* [0, 1, 2, 3];
}
const asyncEnumerable = from(asyncGenerator());

// It accepts both synchronous and asynchronous functions
console.log(await asyncEnumerable.any(x => x === 2)); // Output: true
console.log(await asyncEnumerable.any(x => Promise.resolve(x === 2))); // Output: true
```

### Convert a synchronous LINQ object to asynchronous

```javascript
const enumerable = from(["John", "Smith"]);
const asyncEnumerable = enumerable.asAsync();

// Then it accepts asynchronous functions
const allPresent = await asyncEnumerable.all(async x => await queryPresentAsync(x));
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
    - `asyncEnumerable.ts` and `enumerable.ts` are the empty template classes. Their content will be copied as is.
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
class EnumerableImplementationTemplate<T> {
    private async *where(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}

// Generated asynchronous class
class AsyncEnumerable<T> {
    // A wrapper method will be generated
    public const(predicate: (element: T) => AsyncOrSync<boolean>): AsyncEnumerable<T> {
        return new AsyncEnumerable(this.constImpl(predicate));
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
class Enumerable<T> {
    // A wrapper method will be generated
    // Asynchronous types will be removed from its signature or turned into its synchronous alternative
    public const(predicate: (element: T) => boolean): Enumerable<T> {
        return new Enumerable(this.constImpl(predicate));
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
