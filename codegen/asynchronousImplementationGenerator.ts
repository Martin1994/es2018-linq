import * as TypeScript from "typescript";
import { GeneratableMethodDeclaration, ImplementationGenerator } from "./implementationGenerator";
import { MethodDeclaration, SyntaxKind } from "typescript";

export class AsynchronousImplementationGenerator extends ImplementationGenerator {
    protected *generateAggregateMethod(implMethod: GeneratableMethodDeclaration): Iterable<MethodDeclaration> {
        yield TypeScript.factory.createMethodDeclaration(
            implMethod.decorators,
            [TypeScript.factory.createModifier(SyntaxKind.PublicKeyword), TypeScript.factory.createModifier(SyntaxKind.AsyncKeyword)],
            undefined,
            implMethod.name,
            implMethod.questionToken,
            implMethod.typeParameters,
            implMethod.parameters,
            implMethod.type,
            implMethod.body
        );
    }

    protected *generateStreamMethod(implMethod: GeneratableMethodDeclaration): Iterable<MethodDeclaration> {
        // Wrapper method
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            [TypeScript.factory.createModifier(SyntaxKind.PublicKeyword)],
            undefined,
            implMethod.name,
            undefined,
            implMethod.typeParameters,
            implMethod.parameters,
            TypeScript.factory.createTypeReferenceNode(
                this.className,
                implMethod.type.typeArguments
            ),
            this.generateWrapperBody(implMethod)
        );

        // Implementation method
        yield TypeScript.factory.createMethodDeclaration(
            implMethod.decorators,
            implMethod.modifiers,
            implMethod.asteriskToken,
            TypeScript.factory.createIdentifier(implMethod.name.text + AsynchronousImplementationGenerator.IMPL_METHOD_SUFFIX),
            implMethod.questionToken,
            implMethod.typeParameters,
            implMethod.parameters,
            implMethod.type,
            implMethod.body
        );
    }

    private generateWrapperBody(implMethod: GeneratableMethodDeclaration): TypeScript.Block {
        const iterableResultExpression = TypeScript.factory.createCallExpression(
            TypeScript.factory.createPropertyAccessExpression(
                TypeScript.factory.createThis(),
                implMethod.name.text + AsynchronousImplementationGenerator.IMPL_METHOD_SUFFIX
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
