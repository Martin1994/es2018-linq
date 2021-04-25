import * as TypeScript from "typescript";
import { Block, ClassDeclaration, Identifier, MethodDeclaration, Node, SourceFile, TransformationContext, TypeReferenceNode, Visitor } from "typescript";

export interface GeneratableMethodDeclaration extends MethodDeclaration {
    name: Identifier;
    type: TypeReferenceNode & {
        typeName: Identifier;
    },
    body: Block
}

export abstract class ImplementationGenerator {

    protected static readonly IMPL_METHOD_SUFFIX: string = "Impl";

    protected readonly classSource: SourceFile;
    protected readonly implClass: ClassDeclaration;
    protected readonly context: TransformationContext;
    protected readonly sourceVisitor: Visitor = node => this.visit(node);
    protected className: string = "";

    public constructor(classSource: SourceFile, implClass: ClassDeclaration, context: TransformationContext) {
        this.classSource = classSource;
        this.implClass = implClass;
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
            this.className = node.name.text;
            return TypeScript.factory.updateClassDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.name,
                node.typeParameters,
                TypeScript.factory.createNodeArray(node.heritageClauses),
                [...node.members, ...this.generateMethods()]
            );
        }

        return TypeScript.visitEachChild(node, this.sourceVisitor, this.context);
    }

    private *generateMethods(): Iterable<MethodDeclaration> {
        for (const implMember of this.implClass.members) {
            if (TypeScript.isMethodDeclaration(implMember)) {
                yield* this.generateMethodsFrom(implMember);
            }
        }
    }

    private generateMethodsFrom(implMethod: MethodDeclaration): Iterable<MethodDeclaration> {
        if (!TypeScript.isIdentifier(implMethod.name)) {
            throw new Error("Implementation method must use an identifier as its name.");
        }

        if (!implMethod.type) {
            throw new Error(`Implementation method ${implMethod.name.text}() must have a explicit return type.`);
        }

        if (!TypeScript.isTypeReferenceNode(implMethod.type)) {
            throw new Error(`Implementation method ${implMethod.name.text}() must use a type reference as a return type.`);
        }

        if (TypeScript.isQualifiedName(implMethod.type.typeName)) {
            throw new Error(`Implementation method ${implMethod.name.text}() must not use qualified name as a return type.`);
        }

        if (!implMethod.body) {
            throw new Error(`Implementation method ${implMethod.name.text}() must have a body.`);
        }

        switch (implMethod.type.typeName.text) {
            case "Promise":
                return this.generateAggregateMethod(implMethod as GeneratableMethodDeclaration);

            case "AsyncIterable":
                return this.generateStreamMethod(implMethod as GeneratableMethodDeclaration);
        }

        throw new Error(`Unexpected return type ${implMethod.type.typeName.text} from implementation method ${implMethod.name.text}().`);
    }

    protected abstract generateAggregateMethod(implMethod: GeneratableMethodDeclaration): Iterable<TypeScript.MethodDeclaration>;

    protected abstract generateStreamMethod(implMethod: GeneratableMethodDeclaration): Iterable<TypeScript.MethodDeclaration>;
}
