import * as TypeScript from "typescript";
import { Block, ClassDeclaration, Decorator, GetAccessorDeclaration, Identifier, MethodDeclaration, Modifier, ModifiersArray, Node, SourceFile, SyntaxKind, TransformationContext, TypeReferenceNode, Visitor } from "typescript";

export interface GeneratableMethodDeclaration extends MethodDeclaration {
    readonly type: TypeReferenceNode & {
        typeName: Identifier;
    },
    readonly body: Block,
    readonly modifiers: ModifiersArray;
}

export abstract class ImplementationGenerator {

    protected readonly classSource: SourceFile;
    protected readonly implClasses: Map<string, ClassDeclaration>;
    protected readonly context: TransformationContext;
    protected readonly sourceVisitor: Visitor = node => this.visit(node);

    public constructor(classSource: SourceFile, implClasses: Map<string, ClassDeclaration>, context: TransformationContext) {
        this.classSource = classSource;
        this.implClasses = implClasses;
        this.context = context;
    }

    public generate(): SourceFile {
        return TypeScript.visitNode(this.classSource, this.sourceVisitor);
    }

    private visit(node: Node): Node {
        if (TypeScript.isClassDeclaration(node)) {
            if (!node.name) {
                throw new Error("Template class must have a name.");
            }
            if (!node.name.text.endsWith("Enumerable")) {
                return node;
            }
            return TypeScript.factory.updateClassDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.name,
                node.typeParameters,
                TypeScript.factory.createNodeArray(node.heritageClauses),
                [...node.members, ...this.generateMembers(node.name.text)]
            );
        }

        return TypeScript.visitEachChild(node, this.sourceVisitor, this.context);
    }

    private *generateMembers(className: string): Iterable<MethodDeclaration | GetAccessorDeclaration> {
        const implClassName = this.getImplClassName(className);
        const implClass = this.implClasses.get(implClassName);
        if (!implClass) {
            throw new Error(`Expect class ${implClassName} defined in the template file, but there is no such a class defined.`);
        }
        for (const implMember of implClass.members) {
            if (TypeScript.isMethodDeclaration(implMember)) {
                yield* this.generateMethodsFrom(implMember, className);
            } else if (TypeScript.isGetAccessorDeclaration(implMember)) {
                yield* this.generateGetter(implMember, className);
            }
        }
    }

    private getImplClassName(generatedClassName: string): string {
        if (generatedClassName.startsWith("Async")) {
            return `${generatedClassName.substr(5)}Template`;
        } else {
            return `${generatedClassName}Template`;
        }
    }

    private generateMethodsFrom(implMethod: MethodDeclaration, className: string): Iterable<MethodDeclaration> {
        const methodName = this.getPrintableMethodName(implMethod);

        if (!implMethod.type) {
            throw new Error(`Implementation method ${methodName}() must have a explicit return type.`);
        }

        if (!TypeScript.isTypeReferenceNode(implMethod.type)) {
            throw new Error(`Implementation method ${methodName}() must use a type reference as a return type.`);
        }

        if (TypeScript.isQualifiedName(implMethod.type.typeName)) {
            throw new Error(`Implementation method ${methodName}() must not use qualified name as a return type.`);
        }

        if (!implMethod.body) {
            throw new Error(`Implementation method ${methodName}() must have a body.`);
        }

        if (!implMethod.modifiers) {
            throw new Error(`Implementation method ${methodName}() must have modifiers.`);
        }

        if (implMethod.decorators?.find(decorator => this.isEnumerableWrapperDecorator(decorator)) === undefined) {
            return this.generateMethod(implMethod as GeneratableMethodDeclaration, className);
        } else {
            return this.generateMethodWithWrapper(implMethod as GeneratableMethodDeclaration, className);
        }
    }

    private isEnumerableWrapperDecorator(decorator: Decorator): boolean {
        if (TypeScript.isIdentifier(decorator.expression) && decorator.expression.text === "enumerableWrapper") {
            return true;
        }
        return false;
    }

    protected abstract generateGetter(implMethod: GetAccessorDeclaration, className: string): Iterable<GetAccessorDeclaration>;

    protected abstract generateMethod(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration>;

    protected abstract generateMethodWithWrapper(implMethod: GeneratableMethodDeclaration, className: string): Iterable<MethodDeclaration>;

    protected getImplMethodName(implMethod: MethodDeclaration): string {
        if (TypeScript.isIdentifier(implMethod.name)) {
            return `${implMethod.name.text}Impl`;
        } else {
            throw new Error("Method with wrapper must use identifer as method name.");
        }
    }

    protected getPrintableMethodName(implMethod: MethodDeclaration): string {
        if (TypeScript.isIdentifier(implMethod.name)) {
            return implMethod.name.text;
        } else if (TypeScript.isComputedPropertyName(implMethod.name)) {
            if (
                !TypeScript.isPropertyAccessExpression(implMethod.name.expression) ||
                !TypeScript.isIdentifier(implMethod.name.expression.expression)
            ) {
                throw new Error("Only [Symbol.xyz] is allowed for non-identifier method name.");
            }
            return `[${implMethod.name.expression.expression.text}.${implMethod.name.expression.name.text}]`;
        } else {
            throw new Error("Method with wrapper must use an identifer or [Symbol.xyz] as method name.");
        }
    }

    protected makeModifiersPrivate(modifiers: ModifiersArray | Modifier[]): Modifier[] {
        return [
            TypeScript.factory.createModifier(SyntaxKind.PrivateKeyword),
            ...modifiers.filter(modifier =>
                modifier.kind !== SyntaxKind.PrivateKeyword &&
                modifier.kind !== SyntaxKind.ProtectedKeyword &&
                modifier.kind !== SyntaxKind.PublicKeyword
            )
        ];
    }
}
