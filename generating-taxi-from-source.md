# Generating Taxi from source

## Java & Kotlin [ ![Download](https://api.bintray.com/packages/taxi-lang/releases/java2taxi/images/download.svg) ](https://bintray.com/taxi-lang/releases/java2taxi/_latestVersion)

You can generate Taxi models and services from Java and Kotlin.

{% hint style="info" %}
Examples are shown in Kotlin throughout this guide, as it makes for shorter code snippets.  However, the same approaches will work for Java too.
{% endhint %}

### @DataType & @Namespace

```text
@Namespace("demo")
@DataType
data class Person(...)  // generates demo.Person

@DataType("demo.Person")
data class Person(...)  // generates demo.Person
```

`@DataType` is the main annotation to indicate that a class should have a Taxi schema generated.

Namespaces may be defined either through the `@Namespace("foo.bar")` annotation, or within a `@DataType` directly.

If the namespace isn't provided through either approach, the package name is used.

Fields on types are exported.  By default, the corresponding primitive type in Taxi is used.  However, the output type can be customized by specifying the type in a `@DataType` annotation on the field, which will result in a Type alias within Taxi being generates.

```text
@DataType("demo.Client")
data class Client(@field:DataType("demo.ClientId") val clientId: String,
        val clientName: String,
        @field:DataType("isic.uk.SIC2008") val sicCode: String
)

TaxiGenerator().forClasses(Client::class.java).generateAsStrings()

// Generates:
namespace demo {
    type Client {
        clientId : ClientId as String
        clientName : String
        sicCode : isic.uk.SIC2008
    }
}

namespace isic.uk {
    type alias SIC2008 as String
}
```

{% hint style="info" %}
If you're working in Kotlin, using `typealias` with the `@DataType` annotation is recommended over annotating fields directly, as it leads to more readable & maintainable code.
{% endhint %}

### Support for Kotlin Type Aliases

Type aliases can be directly annotated with the `@DataType` annotation.

```kotlin
@DataType
data class Bus(val passengers: Passengers)

@DataType
typealias Passengers = List<Person>

@DataType("foo.Person")
data class Person(val name: PersonName)

@DataType("foo.PersonName")
typealias PersonName = String

TypeAliasRegistry.register(TypeAliases::class)
val taxiDef = TaxiGenerator().forClasses(Bus::class.java).generateAsStrings()

// Generates:
type Bus {
    passengers : Passengers
}

 type Person {
    name : PersonName
}

type alias PersonName as String
type alias Passengers as Person[]
```

### 

### Taxi Annotation Processor [ ![Download](https://api.bintray.com/packages/taxi-lang/releases/taxi-annotation-processor/images/download.svg) ](https://bintray.com/taxi-lang/releases/taxi-annotation-processor/_latestVersion)

Annotations on `typealias` are [not supported](https://youtrack.jetbrains.com/issue/KT-21489) out-of-the-box through Kotlin's reflection API.  In order to get these to work, we need to use an annotation processor.

#### Capturing annotations at compile time

Add the following to your Maven build:

```text
<build>
   <plugins>
      <plugin>
         <artifactId>kotlin-maven-plugin</artifactId>
         <groupId>org.jetbrains.kotlin</groupId>
         <version>${kotlin.version}</version>
         <executions>
            <execution>
               <id>kapt</id>
               <goals>
                  <goal>kapt</goal>
               </goals>
               <configuration>
                  <annotationProcessorPaths>
                     <annotationProcessorPath>
                        <groupId>lang.taxi</groupId>
                        <artifactId>taxi-annotation-processor</artifactId>
                        <version>0.1.0</version>
                     </annotationProcessorPath>
                  </annotationProcessorPaths>
               </configuration>
            </execution>
            <!-- other executions go here -->
         </executions>
      </plugin>
   </plugins>
</build>
```

This will generate a class called `TypeAliases` which will be compiled into your source, containing the annotation metadata.

#### Using typealias annotations when generating Taxi

To consume the annotations generating Taxi, you need to first register the captured metadata.

Add the annotation processor **as a dependency** to your project, then register the alias metadata:

```markup
<dependency>
    <groupId>lang.taxi</groupId>
    <artifactId>taxi-annotation-processor</artifactId>
    <version>0.1.0</version>
</dependency>
```

```kotlin
TypeAliasRegistry.register(TypeAliases::class)
```

{% hint style="warning" %}
If you're consuming models from multiple different libraries, each will have it's own `TypeAliases` class generated.  Be sure to register them all.
{% endhint %}

{% hint style="warning" %}
You must have at least one class that **isn't a type alias** annotated with `@DataType` present in your jar in order for type aliases to be generated.   
{% endhint %}



### Constraints

Constraints are supported via the `@Constraint` annotation.

```kotlin
@DataType("vyne.Money")
data class Money(val amount: BigDecimal, val currency: String)

@ParameterType
@DataType("vyne.SomeRequest")
data class SomeRequest(
        @Constraint("currency = 'USD'")
        val amount: Money)
        
TaxiGenerator().forClasses(Money::class.java, SomeRequest::class.java).generateAsStrings()

// Generates:
namespace vyne {
     parameter type SomeRequest {
        amount : Money(currency = "USD")
     }
     type Money {
        amount : Decimal
        currency : String
     }
}
```

### Parameter Type

Parameter types are indicated through the `@ParameterType` annotation.

### Services & Operations

Services and Operations are exposed via the `@Service` and `@Operation` annotations respectively.

```kotlin
@Service("taxi.example.PersonService")
class MyService {
    @Operation
    fun findPerson(@DataType("taxi.example.PersonId") personId: String): Person {
    }
}

TaxiGenerator().forClasses(MyService::class.java, Person::class.java).generateAsStrings()

// Generates:
namespace taxi.example {
    type Person {
        personId : PersonId as String
    }
    service PersonService {
        operation findPerson(PersonId) : Person
    }
}
```

Operations may customize the generated name of operation parameters through the `@Parameter` annotation:

```kotlin
@Operation
fun findPerson(@Parameter(name = "personId") id: String): Person ...
```

### Service constraints & contracts

Constraints on parameters are defined by adding `constraints` to the `@Parameter` annotation.

Contracts for operations are defined on the method, using the `@ResponseContract` annotation.

```kotlin
@Service("taxi.example.MoneyService")
class MyService {
    @Operation
    @ResponseContract(basedOn = "source",
            constraints = ResponseConstraint("currency = targetCurrency")
    )
    fun convertRates(@Parameter(constraints = Constraint("currency = 'GBP'")) source: Money, @Parameter(name = "targetCurrency") targetCurrency: String): Money {
        TODO("Not a real service")
    }
}

TaxiGenerator().forClasses(MyService::class.java)

// Generates
namespace taxi.example

type Money {
    currency : Currency as String
    value : MoneyAmount as Decimal
}
service MoneyService {
    operation convertRates( Money( currency = "GBP" ),
        targetCurrency : String ) : Money( from source, currency = targetCurrency )
}

```

### Taxi Generator customisation & extensions

Taxi's generator can be customized, adding additional annotations or modfiying the tree structure before source is output.  

The most common scenario here is to provide extensions to modify how services are generated.  However, you can inject an entirely separate `TypeMapper` and `ServiceMapper` for complete control over the generation process.  Take a look at [TaxiGenerator](https://gitlab.com/taxi-lang/taxi-lang/blob/master/java2taxi/src/main/java/lang/taxi/generators/java/TaxiGenerator.kt) to get started.

[ServiceMapperExtension](https://gitlab.com/taxi-lang/taxi-lang/blob/master/java2taxi/src/main/java/lang/taxi/generators/java/ServiceMappings.kt#L25) and [OperationMapperExtension](https://gitlab.com/taxi-lang/taxi-lang/blob/master/java2taxi/src/main/java/lang/taxi/generators/java/ServiceMappings.kt#L29) provide the ability to modify the way services are generated, injecting custom metadata \(eg., to describe HTTP operations, or how to subscribe to a message bus\).

The SpringMVC extensions \(discussed below\) give a good example of how to leverage this.

### Spring MVC Extensions

java2taxi ships with extensions for Spring MVC, to add metadata about how services are discovered and invoked.  They add the following features:

* Support for mapping `@GetMapping`/`@PostMapping` etc to an `HttpOperation()` annotation on the output.
  * All HTTP methods are supported
  * Path variable substitution is supported
* Support for mapping springs `@RequestBody` annotation to a corresponding `@RequestBody` annotation on the generated Taxi source.
* Support for integration with service discovery from Spring Cloud's `DiscoveryClient` abstraction

{% hint style="info" %}
Currently, the SpringMVC extensions are part of java2taxi.  However, we expect to move these out to their own library in a future release.
{% endhint %}



Enable the extensions by configuring the `TaxiGenerator` as follows:

```kotlin
val taxiGenerator = TaxiGenerator(serviceMapper = DefaultServiceMapper(
    operationExtensions = listOf(SpringMvcHttpOperationExtension()),
    serviceExtensions = listOf(SpringMvcHttpServiceExtension(ServiceDiscoveryAddressProvider("mockService")))
))
```

Example usage:

```kotlin
@RequestMapping("/costs")
@Service("vyne.demo.CreditCostService")
class CreditCostService {
    @Operation
    @GetMapping("/interestRates/{clientId}")
    fun getInterestRate(@PathVariable("clientId") @DataType("vyne.demo.ClientId") clientId: String): BigDecimal = BigDecimal.ONE

    // Back off, REST snobs.  Method names are here for testing.
    @PostMapping("/{clientId}/doCalculate")
    @Operation
    fun calculateCreditCosts(@PathVariable("clientId") @DataType("vyne.demo.ClientId") clientId: String, @RequestBody request: CreditCostRequest): CreditCostResponse = CreditCostResponse("TODO")
}

taxiGenerator.forClasses(CreditCostService::class.java).generateAsStrings()

// Generates:
namespace vyne.demo {

    type alias ClientId as String

     type CreditCostRequest {
        deets : String
    }

     type CreditCostResponse {
        stuff : String
    }

    @ServiceDiscoveryClient(serviceName = "mockService")
    service CreditCostService {
        @HttpOperation(method = "GET" , url = "/costs/interestRates/{vyne.demo.ClientId}")
        operation getInterestRate(  ClientId ) : Decimal
        @HttpOperation(method = "POST" , url = "/costs/{vyne.demo.ClientId}/doCalculate")
        operation calculateCreditCosts(  ClientId, @RequestBody CreditCostRequest ) : CreditCostResponse
    }
}

```

The [tests](https://gitlab.com/taxi-lang/taxi-lang/blob/master/java2taxi/src/test/java/lang/taxi/generators/java/extensions/HttpExtensionTest.kt) give the best example of usage.

### 

### Maven / Gradle

The binaries are available on [Bintray](https://bintray.com/taxi-lang/releases).  Be sure to add the repository:

```text
<repositories>
    <repository>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
        <id>bintray-taxi-lang-releases</id>
        <name>bintray</name>
        <url>https://dl.bintray.com/taxi-lang/releases</url>
    </repository>
</repositories>
```

Then grab the artifacts:

```text
<!-- To generate Taxi, you need java2taxi -->
<dependency>
  <groupId>lang.taxi</groupId>
  <artifactId>java2taxi</artifactId>
  <version>0.1.0</version>
</dependency>

<!-- To annotate your models, you need the annotations package -->
<dependency>
  <groupId>lang.taxi</groupId>
  <artifactId>taxi-annotations</artifactId>
  <version>0.1.0</version>
</dependency>
```

## Swagger / OpenApi [ ![Download](https://api.bintray.com/packages/taxi-lang/releases/swagger2taxi/images/download.svg) ](https://bintray.com/taxi-lang/releases/swagger2taxi/_latestVersion)

It's possible to convert a swagger document to Taxi, using the `TaxiGenerator` from the `openApi` package.

This is especially useful if you want to take advantage of Taxi's type extensions, to mix in annotations.  \(eg., persistence or validation\).

Grab the taxi generator from maven:

```text
<dependency>
  <groupId>lang.taxi</groupId>
  <artifactId>swagger2taxi</artifactId>
  <version>0.1.0</version>
</dependency>
```

Then run the converter as follows:

\(Note, this example loads source from [this reference example](https://gitlab.com/taxi-lang/taxi-lang/raw/master/swagger2taxi/src/test/resources/openApiSpec/v2.0/yaml/petstore-simple.yaml) from the OpenApi project - 

```text
// The actual swagger source is omitted for brevity
val source = IOUtils.toString(URI.create("https://gitlab.com/taxi-lang/taxi-lang/raw/master/swagger2taxi/src/test/resources/openApiSpec/v2.0/yaml/petstore-simple.yaml"))
TaxiGenerator().generateAsStrings(source, "vyne.openApi")

// generated: 
namespace vyne.openApi  {

    type NewPet {
        name : String
        tag : String
    }

     type Pet inherits NewPet {
        id : Int
    }

     type ErrorModel {
        code : Int
        message : String
    }

    service PetsService {
        @HttpOperation(method = "GET" , url = "http://petstore.swagger.io/api/pets")
        operation findPets(  tags : String,  limit : Int ) : Pet[]
        @HttpOperation(method = "POST" , url = "http://petstore.swagger.io/api/pets")
        operation addPet( @RequestBody pet : NewPet ) : Pet
    }
    service PetsIdService {
        @HttpOperation(method = "GET" , url = "http://petstore.swagger.io/api/pets/{id}")
        operation findPetById(  id : Int ) : Pet
        @HttpOperation(method = "DELETE" , url = "http://petstore.swagger.io/api/pets/{id}")
        operation deletePet(  id : Int )
    }
}
```



