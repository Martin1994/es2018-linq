import * as TypeScript from "typescript";
import { GeneratableMethodDeclaration, ImplementationGenerator } from "./implementationGenerator";
import { Block, MethodDeclaration, Node, ParameterDeclaration, SyntaxKind } from "typescript";

export class SynchronousImplementationGenerator extends ImplementationGenerator {
    protected *generateAggregateMethod(implMethod: GeneratableMethodDeclaration): Iterable<MethodDeclaration> {
        if (!implMethod.type.typeArguments) {
            throw new Error(`Implementation method ${implMethod.name.text}() must return a Promise with a type argument.`);
        }

        yield TypeScript.factory.createMethodDeclaration(
            implMethod.decorators,
            [TypeScript.factory.createModifier(SyntaxKind.PublicKeyword)],
            undefined,
            implMethod.name,
            implMethod.questionToken,
            implMethod.typeParameters,
            implMethod.parameters,
            implMethod.type.typeArguments[0],
            this.convertMethodBody(implMethod.body)
        );
    }

    protected *generateStreamMethod(implMethod: GeneratableMethodDeclaration): Iterable<MethodDeclaration> {
        const parameters = this.convertParameters(implMethod.parameters);

        // Wrapper method
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            [TypeScript.factory.createModifier(SyntaxKind.PublicKeyword)],
            undefined,
            implMethod.name,
            undefined,
            implMethod.typeParameters,
            parameters,
            TypeScript.factory.createTypeReferenceNode(
                this.className,
                implMethod.type.typeArguments
            ),
            this.generateWrapperBody(implMethod)
        );

        // Implementation method
        yield TypeScript.factory.createMethodDeclaration(
            implMethod.decorators,
            implMethod.modifiers?.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword),
            implMethod.asteriskToken,
            TypeScript.factory.createIdentifier(implMethod.name.text + SynchronousImplementationGenerator.IMPL_METHOD_SUFFIX),
            implMethod.questionToken,
            implMethod.typeParameters,
            parameters,
            TypeScript.factory.createTypeReferenceNode(
                "Iterable",
                implMethod.type.typeArguments
            ),
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

            return TypeScript.visitEachChild(node, visitor, context);
        }
        return parameters.map(parameter => TypeScript.visitEachChild(parameter, visitor, context));
    }

    private convertMethodBody(block: Block): Block {
        const context = this.context;
        function visitor(node: Node): Node {
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

            return TypeScript.visitEachChild(node, visitor, context);
        }
        return TypeScript.visitEachChild(block, visitor, context);
    }

    private generateWrapperBody(implMethod: GeneratableMethodDeclaration): TypeScript.Block {
        const iterableResultExpression = TypeScript.factory.createCallExpression(
            TypeScript.factory.createPropertyAccessExpression(
                TypeScript.factory.createThis(),
                implMethod.name.text + SynchronousImplementationGenerator.IMPL_METHOD_SUFFIX
            ),
            undefined,
            implMethod.parameters.map(parameter => {
                if (!TypeScript.isIdentifier(parameter.name)) {
                    throw new Error(`Implementation method ${implMethod.name.text}() must use identifiers as parameter names.`);
                }
                return TypeScript.factory.createIdentifier(parameter.name.text);
            })
        );

        return TypeScript.factory.createBlock([
            TypeScript.factory.createReturnStatement(
                TypeScript.factory.createNewExpression(
                    TypeScript.factory.createIdentifier(this.className),
                    undefined,
                    [iterableResultExpression]
                )
            )
        ], true);
    }
}
