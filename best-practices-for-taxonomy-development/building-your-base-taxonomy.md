# Building your base taxonomy

## Overview

Your base taxonomy defines the core set of types that are used to describe services and models.  They're the building blocks that form the basis of your organisation's taxonomy.

Think of your taxonomy as a shared vocabulary, rather than as a series of shared models. \(See the [Common Domain Model Antipattern](./#common-domain-model) for more detail\)

A good sign of a well defined taxonomy is one that can be applied easily by service developers throughout their own domain models.

## Types, not models

### Avoid types with attributes

{% hint style="info" %}
Models are great, but they're best left to individual systems to define, rather than the central taxonomy.
{% endhint %}

Try to keep your central taxonomy populated with terms, are than models.  Therefore, be careful as you start to add attributes to items in your central taxonomy, as it starts to become a [shared domain model](./#common-domain-model), which has real drawbacks.

Whenever you add an attribute, remember that **all** consumers and publishers have to be able to satisfy the contract, or they won't be able to use the type.  You're often better off defining the attributes independently.  This allows consumers of the taxonomy to compose and arrange the attributes in ways that are meaningful to them. 

This isn't to say that nested, tree structure models aren't useful - they are.  But we think that the developers of services should define the models that are most meaningful to them.  This is easier to do when the taxonomy contains simple types.

### Use the correct base type

**Do:** Select the most appropriate type to model the concept. Encourage others to do the same.  
**Avoid:** Typing things as 'String', when another type is a better fit.

## Inheritance & Aliases

When building a rich semantic model for describing business terms, inheritence is a powerful way to increase the richness of terms.

### Use `inherits` to increase specificity

In Object Oritented software, inheritance is often discouraged.

However, in taxonomy land, when were modelling single-attribute types, `inherits` is a great way building a heirarchy of specialisation.

```text
type Name inherits String
type FirstName inherits Name
type LastName inherits Name
```

Inheriance works in a single direction.  ie., using the above example, we can say:

> All `FirstNames` are also `Names`, but not all `Names` are `FirstNames`

### Use type aliases when things are synonymous

Type aliases are useful for indicating two ideas \(generally from different taxonomies or schemas\) mean exactly the same thing.

```text
type FirstName inherits Name
type LastName inherits Name

type alias GivenName as FirstName // GivenNames and FirstNames are interchangeable
type alias Surname as LastName 
```

{% hint style="warning" %}
Only use type aliases when two things are entirely interchangable.  If things are _similar_, but _synonymous_ then avoid type aliases, and consider inheritance instead
{% endhint %}

### Avoid system-specific and publisher-specific variations in the base taxonomy



### Use inheritence to refine the "what", not the "who", "when" or "where"

Use inheritence when you want to capture that something is a specialisation of a concept, rather than for modelling the context surrounding a concept.

ie.,  avoid specialising types to cater for concepts such as:

* Who created it
* When it was created
* Where it was published

For example, avoid things like:

```text
// Don't do this
type AmazonPrice inherits Price
```

{% hint style="info" %}
An upcoming language feature called Context is intended for modelling this type of information
{% endhint %}

