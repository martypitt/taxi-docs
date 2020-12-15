# Core Taxi Language

Taxi is a language for documenting the contracts governing the flow of data between companies and systems. It documents the models they return, and the operations they can perform.

Taxi allows the taxonomy author to describe those contracts in consistent, business friendly language, and most importantly reuse that language across many contracts. In practice, it means if on one contract say one attribute is a PostCode and you say another contract another attribute is also a PostCode, then they are identical.

Taxi is used heavily to power[ Vyne](https://vyne.co/) - and the projects have influenced each other & evolved together. The expressiveness of Taxi allows Vyne to automate integration between services.

Vyne, on the other hand, is a platform for automating integration between services.

Vyne provides intelligent on-the-fly integrations, that automatically upgrade themselves as your services update.   


**Tl/Dr Taxi is the language that powers Vyne, a platform for automating integration.**

## Key Concepts

### Inheritance

Taxi describes discrete attributes or types as part of a taxonomy. A taxonomy describes data hierarchically as set out below. If you look at the simple animal taxonomy below, you see a broad topic, animals, gradually becomes more refined to snakes or felines. Each level of the taxonomy retains the characteristics of its parent while gradually getting more specific. So a canine is type of a mammal, which is a type of animal. 

This specialisation, whilst retaining information of the parent is called **Inheritance**.

![An Animal Taxonmy](.gitbook/assets/animals-taxonomy.png)

### Primitive types

Taxi is a strongly typed language, that is, a discrete attribute will ultimately inherit from a number of limited primitive types. If you recall, the our example taxonomy had “animal” at the top, these primitive types will replace “animal” in taxonomies you design.

Taxi currently supports the following primitive types.  \(See the [Language Spec](https://gitlab.com/taxi-lang/taxi-lang/blob/master/compiler/src/main/antlr4/lang/taxi/Taxi.g4#L207)\)

| Taxi Type | Comments |
| :--- | :--- |
| Boolean | `true` or `false` |
| String | Strings are quoted in "double quotes" |
| Int | A numeric type without decimal places |
| Double | A numeric type with decimal places |
| Decimal | A numeric type with decimal places |
| Date | Full date notations, in the format of `yyyy-mm-dd`.  Does not support time, or time-zones |
| Time | A time, in the form of `hh:mm:ss`.  Does not support dates, or time-zones. |
| DateTime | A combination of `Date` and `Time` types, in the format of `yyyy-mm-ddThh:mm:ss`.  Does not support time-zones. |
| Instant | A timestamp indicating an absolute point in time.  Includes time-zone.  Should be rfc3339 format - \(eg: `2016-02-28T16:41:41.090Z`\) |

### Inheritance and Primitive Types

Now that we understand primitive types and inheritance, what does that mean for our taxonomy? Modifying our animal example and looking and putting a primitive type of String at the top, you can see that we start to build a set of more and more specific definitions as move down the taxonomy. 

In practice, the taxonomy will only be 2 or 3 levels deep at most, but you can see an OrderId, is a kind of Identifier Value which, in turn is a kind of String. 

You can immediately begin to think about how can apply specific semantic meaning without repetition.

![An example Taxonomy](.gitbook/assets/taxonomy-example.png)

## Types

Types are the basic building block of an API.

```text
/** Comments can be defined in either
 * block style, or // inline style
*/
namespace taxi.demo { // Namespaces are optional, but reccommended.
    @SomeAnnotation
    type Person {
        @Id // Arbitary annotations are supported at both class and field level
        id : PersonId as Int // Inline type alises allow succinct Microtypes
        
        firstName : FirstName as String
        lastName : String // You don't have to use microtypes if they don't add value
        
        friends : Person[] // Lists are supported
        
        spouse : Person? // '?' indicates nullable types
    }
}
```

### 

### Nullability

All types are considered mandatory \(non-nullable\), unless explicitly represented as nullable with the `?` operator.

```text
type Person {
    id : Id as Int // Mandatory
    spouse : Person? // Optional - may be null.
}
```

### Inheritance

Taxi currently has basic support for inheritance:

```text
type TypeA {
    fieldA : String
}
type TypeB inherits TypeA {
    fieldB : String
}
type TypeC inherits TypeB {
    fieldC : String
}

// TypeD inherits TypeA and TypeB.  TypeB also inherits TypeA.
// TypeD has fields fieldA, fieldB and fieldC
type TypeD inherits TypeA, TypeB {}
```

### Enum types

Enum types are defined as follows:

```text
enum BookClassification {
    @Annotation // Enums may have annotations
    FICTION,
    NON_FICTION
}
```

#### Enum synonyms

Synonyms may be declared between values in multiple sets of enums.  This is useful when two different systems publish the same concept in slightly different formats.

```text
namespace acme {
   enum Country {
      NEW_ZEALAND,
      AUSTRALIA,
      UNITED_KINGDOM
   }
}

namespace foo {
   
   enum Country {
      NZ synonym of acme.Country.NEW_ZEALAND,
      AUS synonym of acme.Country.AUSTRALIA,
      UK synonym of acme.Country.UNITED_KINGDOM
   }
}
```

Synonyms are bi-directional, so whenever `foo.Country.NZ` is used, `acme.Country.NEW_ZEALAND` could also be used.

#### Enum values

Enums may declare values:

```text
enum Country {
      NEW_ZEALAND("NZ"),
      AUSTRALIA("AUS"),
      UNITED_KINGDOM("UK")
}
```

### Type Aliases

Taxi has strong support for type aliases, and judicious usage of micro-types are encouraged.

Type aliases may be defined in one of two ways, either explicitly using the `type alias` declaration, or inline using `Microtype as Primitive` syntax

```text
@Annotation // Type-aliases may have annotations
type alias FirstName as String

type Person {
    firstName : FirstName
    lastName : LastName as String // defining a type alias in-line.
}
```

If using the inline declaration syntax, then a type alias may only be defined once, or an exception is thrown by the compiler.

### Parameter types

Parameter types are special types that indicate to tooling that it's safe to construct these at runtime.  Declaring something as a Parameter type has no other impact within Taxi on the type's definition, but is used in other tooling.  \(Eg., Vyne\).

```text
service PeopleService {
    operation createPerson(CreatePersonRequest):Person
}

type Person {
    id : Id as Int
    firstName : FirstName as String
    lastName : LastName as String
}

parameter type CreatePersonRequest {
    firstName : FirstName
    lastName : LastName
}
```

### Type constraints

A type may express a constraint that indicates what is a permissible value:

```text
enum Currency {
   GBP, USD
}
type Money {
   currency : Currency
   amount : MoneyAmount as Decimal
}
type DepositCashRequest {
   // We only accept deposits in GBP
   amount : Money(currency = 'GBP')
   clientId : ClientId as String
}
```

{% hint style="info" %}
Taxi doesn't perform any validation of this itself - it's up to the services that consume and product the types.  However, by making the contract part of the API definition, it allows for tooling to automate the validation process, and to automate interaction between services.
{% endhint %}

The types of constraints supported are discussed in [Operation Contracts](taxi-language.md#operation-contracts-and-constraints)

## Taxi Doc

All elements in taxi can be documented using taxidoc - which is simply markdown, wrapped in a `[[` and `]]`

```text
[[
This is some typedoc.
Any [markdown](https://daringfireball.net/projects/markdown/syntax) is valid
]]
type TaxiDocExample
```



## Annotations

Annotations can be defined against any of the following:

* Types
* Fields
* Enums
* Services
* Operations

Annotations may have parameters, or be left 'naked':

```text
@ValidAnnotation
@AnotherAnnotation(stringParam = 'hello', boolValue = true, intValue = 123)
type Foo {}
```

Annotation parameters may be values of type  `string`,`int` or `boolean`

{% hint style="info" %}
Annotations do not have any direct impact on the types.  However, they can be used to power tooling - such as generators, or to provide hints to consumers
{% endhint %}

{% hint style="info" %}
Currently, there's no contracts or type checking around annotations, beyond basic syntax checking.  However, this is expected to be improved in a future release.
{% endhint %}

## Type Extensions

Type extensions allow mixing in additional data to a type after it's been defined.  

It's possible to extend a type by adding either annotations, or type refinements.  Structural changes to types are not permitted \(and the compiler will prevent them\).

Type extensions can be defined either in the same file, or \(more typically\), in a different file from the original defining type.

```text
// As defined in one file.
type Person {
    personId : Int
    firstName : String
    lastName : String
}

type alias FirstName as String
// Extending the type to provide additional context:
type extension Person {

    // Adding an annotation.  No additional type is defined, so the 
    // underlying type remains the same -- an Int
    @Id
    personId 
    
    // Refining the type.  Note that FirstName represents the same
    // type as the original String, so this is permitted.
    // If the types were incompatible, the compiler would throw an exception
    firstName : FirstName
}
```

There are a few scenarios where this may be useful:

#### Refining types with type aliases

Not all languages and spec tools are created equal - and some don't have great support for type aliases.  Extensions allow for the narrowing \(but not redefinition\) of the type, through type aliases. 

#### Mixing-in metadata

A consumer of an API may wish to leverage tooling that uses annotations - eg., persisting an entity into a database.  Type extensions allow providing tooling specific metadata that's only useful to the consumer - not the producer.

## Namespaces

Namespaces provide a way to qualify type names.  They are analogous to `namespaces` in C\#, or `package` in Java / Kotlin.

```text
namespace demo.people {
    // Defines "demo.people.Person"
    type Person {}
    
    type MovieCharacter {
       name : String
       // When referencing types from within the same namespace, 
       // they don't need to be qualified
       actor : Person
    }
}

namespace books {
    type Book {
        // Fully qualified names are needed when referencing namespaced types 
        // from another namespace
        author : demo.people.Person
    }
}
```

When namespaces are in use, the following rules apply:

* Type references within the same namespace need not qualify their references
* Type references within a different namespace must use a fully qualified reference

{% hint style="info" %}
It's not mandatory to use namespaces, but it's recommended.  It's useful to avoid name collisions and improves the output from generators, which typically are targeting languages that **do** use packages / namespaces
{% endhint %}

## Services & Operations

### Services

A services is simply a group of operations.

```text
service PeopleService {
   operation listAllPeople():Person[]
}
```

### Operation

An operation defines a function on the API.

```text
@HttpOperation(method = 'GET', url = 'https://myservice/people')
operation listAllPeople():Person[]
```

Operations often have annotations that provide hints to tooling as to how to invoke them.

Taxi ships with some standard annotations, as part of it's [std-lib](https://gitlab.com/taxi-lang/taxi-lang/tree/master/taxi-stdlib-annotations/src/main/java/lang/taxi/annotations).  Although it's up to individual tooling to determine how to interpret these, the suggested usage is as follows:

| Annotation | Usage |
| :--- | :--- |
| `@HttpOperation(method,url)` | Indicates that the operation should be invoked over HTTP, using the provided `method` and `url` |
| `@HttpRequestBody` | Indicates that a parameter will be found on the request body |
| `@ServiceDiscoveryClient(serviceName)` | Indicates that the service's absolute url should be discovered from Service Discovery, using the provided name for lookup |

#### Operation parameters

Names of operation parameters are optional.  This is to encourage developers to leverage a richer type system where possible:

```text
// These two declarations are both valid, and desribe the same operation
operation convertUnits(source:Weight, targetUnit:Unit):Weight
operation convertUnits(Weight,Unit):Weight
```

### Operation Contracts & Constraints

Contracts and constraints are useful for telling tooling about what functionality an operation can provide, and what conditions must be met before invoking.  

Both contracts and constraints use the same syntax.

```text
type Money {
   currency : String
   amount : Decimal
}
operation convertCurrency(input: Money, 
      targetCurrency: String) : Money(from input, currency = targetCurrency)
```

#### \`from input\` 

A contract may indicate that a return type is derived from one of the inputs, by using the `from {input}` syntax:

```text
operation convertUnits(input: Weight, target: Unit):Weight( from input )
```

#### Attribute constraints

Attribute constraints describe either a pre-condition \(if on an input\) or a post-condition \(if on a return type\) for an operation

```text
operation convertFromPounds(input : Money(currency = 'GBP'), target: Currency) 
    : Money( from input, currency = target)
```

As shown above, attribute constraints may either be:

* A constant value \(ie., `"GBP"`\)
* A reference to an attribute of another parameter.
  * Nested syntax is supported \(ie., `foo.bar.baz`\)

These constraints are applicable on types too - see [type constraints](taxi-language.md#type-constraints) for an example.

{% hint style="info" %}
This is an area of taxi that we expect to see significant development in, to improve the richness of the possible expressions 
{% endhint %}



