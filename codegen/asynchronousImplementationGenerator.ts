import * as TypeScript from "typescript";
import { GeneratableMethodDeclaration, ImplementationGenerator } from "./implementationGenerator";
import { GetAccessorDeclaration, MethodDeclaration, SyntaxKind } from "typescript";

export class AsynchronousImplementationGenerator extends ImplementationGenerator {
    /**
     * @override
     */
    protected *generateGetter(implMethod: GetAccessorDeclaration, className: string): Iterable<GetAccessorDeclaration> {
        yield TypeScript.factory.createGetAccessorDeclaration(
            undefined,
            implMethod.modifiers,
            implMethod.name,
            implMethod.parameters,
            implMethod.type,
            implMethod.body
        );
    }

    /**
     * @override
     */
    protected *generateMethod(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration> {
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            implMethod.modifiers,
            implMethod.asteriskToken,
            implMethod.name,
            implMethod.questionToken,
            implMethod.typeParameters,
            implMethod.parameters,
            implMethod.type,
            implMethod.body
        );
    }

    /**
     * @override
     */
    protected *generateMethodWithWrapper(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration> {
        if (!TypeScript.isIdentifier(implMethod.name)) {
            throw new Error("Method with wrapper must use identifer as method name.");
        }

        // Wrapper method
        yield TypeScript.factory.createMethodDeclaration(
            undefined,
            implMethod.modifiers.filter(modifier => modifier.kind !== SyntaxKind.AsyncKeyword),
            undefined,
            implMethod.name,
            undefined,
            implMethod.typeParameters,
            implMethod.parameters,
            TypeScript.factory.createTypeReferenceNode(
                className,
                implMethod.type.typeArguments
            ),
            implMethod.body ? this.generateWrapperBody(implMethod, className) : undefined
        );

        if (implMethod.body) {
            // Implementation method
            yield TypeScript.factory.createMethodDeclaration(
                undefined,
                this.makeModifiersPrivate(implMethod.modifiers),
                implMethod.asteriskToken,
                TypeScript.factory.createIdentifier(this.getImplMethodName(implMethod)),
                implMethod.questionToken,
                implMethod.typeParameters,
                implMethod.parameters,
                TypeScript.factory.createTypeReferenceNode(
                    "AsyncIterable",
                    implMethod.type.typeArguments
                ),
                implMethod.body
            );
        }
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
