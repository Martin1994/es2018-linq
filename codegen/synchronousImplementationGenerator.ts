import * as TypeScript from "typescript";
import { GeneratableMethodDeclaration, ImplementationGenerator } from "./implementationGenerator";
import { Block, GetAccessorDeclaration, MethodDeclaration, Node, ParameterDeclaration, SyntaxKind, TypeNode } from "typescript";

export class SynchronousImplementationGenerator extends ImplementationGenerator {
    /**
     * @override
     */
    protected *generateGetter(implMethod: GetAccessorDeclaration, className: string): Iterable<GetAccessorDeclaration> {
        if (!implMethod.body) {
            throw new Error("Accessor must have a body.");
        }

        yield TypeScript.factory.createGetAccessorDeclaration(
            undefined,
            implMethod.modifiers?.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword),
            implMethod.name,
            this.convertParameters(implMethod.parameters),
            this.convertReturnType(implMethod.type),
            this.convertMethodBody(implMethod.body)
        );
    }

    /**
     * @override
     */
    protected *generateMethod(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration> {
        if (!implMethod.type.typeArguments) {
            throw new Error(`Implementation method ${this.getPrintableMethodName(implMethod)}() must return a Promise with a type argument.`);
        }

        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            implMethod.modifiers.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword),
            implMethod.asteriskToken,
            implMethod.name,
            implMethod.questionToken,
            implMethod.typeParameters,
            this.convertParameters(implMethod.parameters),
            this.convertReturnType(implMethod.type),
            this.convertMethodBody(implMethod.body)
        );
    }

    /**
     * @override
     */
    protected *generateMethodWithWrapper(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration> {
        const parameters = this.convertParameters(implMethod.parameters);

        // Wrapper method
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            implMethod.modifiers.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword),
            undefined,
            implMethod.name,
            undefined,
            implMethod.typeParameters,
            parameters,
            TypeScript.factory.createTypeReferenceNode(
                className,
                implMethod.type.typeArguments
            ),
            this.generateWrapperBody(implMethod, className)
        );

        // Implementation method
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            this.makeModifiersPrivate(implMethod.modifiers?.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword)),
            implMethod.asteriskToken,
            TypeScript.factory.createIdentifier(this.getImplMethodName(implMethod)),
            implMethod.questionToken,
            implMethod.typeParameters,
            parameters,
            this.convertReturnType(implMethod.type),
            this.convertMethodBody(implMethod.body)
        );
    }

    private convertParameters(parameters: ReadonlyArray<ParameterDeclaration>): ParameterDeclaration[] {
        const context = this.context;
        function visitor(node: Node): Node {
            if (TypeScript.isIdentifier(node)) {
                if (node.text === "AsyncOrSyncIterable") {
                    return TypeScript.factory.createIdentifier("Iterable");
                }
            }

            if (TypeScript.isTypeReferenceNode(node)) {
                if (TypeScript.isIdentifier(node.typeName)) {
                    if (node.typeName.text === "AsyncOrSync") {
                        if (!node.typeArguments) {
                            throw new Error("AsyncOrSync<T> must be used with a type argument.");
                        }
                        return node.typeArguments[0];
                    }
                }
            }

            return TypeScript.visitEachChild(node, visitor, context);
        }
        return parameters.map(parameter => TypeScript.visitEachChild(parameter, visitor, context));
    }

    private convertReturnType(type: TypeNode | undefined): TypeScript.TypeNode | undefined {
        if (!type || !TypeScript.isTypeReferenceNode(type) || !TypeScript.isIdentifier(type.typeName)) {
            throw new Error("Accessor must declare return type with identifier.");
        }
        switch (type.typeName.text) {
            case "Promise":
                if (!type.typeArguments) {
                    throw new Error("Promise muse be used with a type argument.");
                }
                return type.typeArguments[0];

            case "AsyncIterable":
                return TypeScript.factory.updateTypeReferenceNode(
                    type,
                    TypeScript.factory.createIdentifier("Iterable"),
                    type.typeArguments
                );

            case "AsyncIterator":
                return TypeScript.factory.updateTypeReferenceNode(
                    type,
                    TypeScript.factory.createIdentifier("Iterator"),
                    type.typeArguments
                );

            case "AsyncSortedEnumerable":
                return TypeScript.factory.updateTypeReferenceNode(
                    type,
                    TypeScript.factory.createIdentifier("SortedEnumerable"),
                    type.typeArguments
                );
        }
        throw new Error(`Unknown return type ${type.typeName.text}`);
    }

    private convertMethodBody(block: Block): Block {
        const context = this.context;
        function visitor(node: Node): Node {
            // Remove await from for await
            if (TypeScript.isForOfStatement(node)) {
                if (node.awaitModifier) {
                    return TypeScript.factory.createForOfStatement(
                        undefined,
                        TypeScript.visitEachChild(node.initializer, visitor, context),
                        TypeScript.visitEachChild(node.expression, visitor, context),
                        TypeScript.visitEachChild(node.statement, visitor, context)
                    );
                }
            }

            // Remove await from await statements
            if (TypeScript.isAwaitExpression(node)) {
                return node.expression;
            }

            // Convert Symbol.asyncIterator to Symbol.iterator
            if (TypeScript.isPropertyAccessExpression(node)) {
                if (TypeScript.isIdentifier(node.expression)) {
                    if (node.expression.text === "Symbol") {
                        if (node.name.text === "asyncIterator") {
                            return TypeScript.factory.updatePropertyAccessExpression(
                                node,
                                node.expression,
                                TypeScript.factory.createIdentifier("iterator")
                            );
                        }
                    }
                }
            }

            if (TypeScript.isIdentifier(node)) {
                // Convert AsyncIterable<T> to Iterable<T>
                if (node.text === "AsyncIterable") {
                    return TypeScript.factory.createIdentifier("Iterable");
                }

                // Convert AsyncSortedEnumerable<T> to SortedEnumerable<T>
                if (node.text === "AsyncSortedEnumerable") {
                    return TypeScript.factory.createIdentifier("SortedEnumerable");
                }
            }

            return TypeScript.visitEachChild(node, visitor, context);
        }
        return TypeScript.visitEachChild(block, visitor, context);
    }

    private generateWrapperBody(implMethod: GeneratableMethodDeclaration, className: string): TypeScript.Block {
        const iterableResultExpression = TypeScript.factory.createCallExpression(
            TypeScript.factory.createPropertyAccessExpression(
                TypeScript.factory.createThis(),
                this.getImplMethodName(implMethod)
            ),
            undefined,
            implMethod.parameters.map(parameter => {
                if (!TypeScript.isIdentifier(parameter.name)) {
                    throw new Error(`Implementation method ${this.getPrintableMethodName(implMethod)}() must use identifiers as parameter names.`);
                }
                return TypeScript.factory.createIdentifier(parameter.name.text);
            })
        );

        return TypeScript.factory.createBlock([
            TypeScript.factory.createReturnStatement(
                TypeScript.factory.createNewExpression(
                    TypeScript.factory.createIdentifier(className),
                    undefined,
                    [iterableResultExpression]
                )
            )
        ], true);
    }
}
