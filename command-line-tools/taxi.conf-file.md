# taxi.conf File

A `taxi.conf` file describes a project's layout, and the plugins to be invoked after compilation.  It follows the [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md#hocon-human-optimized-config-object-notation) format, which is like supercharged JSON.

```text
name: taxi/maven-sample
version: 0.3.0
sourceRoot: src/
plugins: {
   taxi/kotlin: {
      maven: {
         groupId: "lang.taxi"
         artifactId: "parent"
         repositories: [
            {
               id: "internal-repo"
               url: "https://newcorp.nexus.com"
               snapshots: true
            }
         ]
      }
   }
}

```

The source for the config can be seen [here](https://gitlab.com/taxi-lang/taxi-lang/-/blob/develop/core-types/src/main/java/lang/taxi/packages/TaxiPackageProject.kt), which provides the complete documentation of how projects can be configued.

| Name | The name of the  |
| :--- | :--- |
| name | The name of the taxi project.  By convention, follows a format of `organisation/project-name` |
| version | The version of the taxi project |
| sourceRoot | The root location of taxi files to be compiled |
| output | The folder where any generated artifacts will be written |
| plugins | A list of [plugins](plugins/) to enabled on the project |
| pluginSettings | Defines where plugins are fetched and loaded from |
| dependencies | A list of other taxi project dependencies that this project depends on |
| repositories | A list of taxi repositories to fetch content from |
| publishToRepository | Defines where this project should be published to, should other projects wish to depend on it |

### Dependencies

Projects may declare dependenices on other taxi projects.  This provides a powerful mechanism for creating modular, re-usable taxonomies across organisations.

The format for declaring dependencies is:

```text
dependencies: {
    org/ProjectName : 0.2.0
}
```

An example configuration for declaring dependencies is shown [here](https://gitlab.com/taxi-lang/taxi-lang/-/blob/develop/package-importer/src/test/resources/testRepo/taxi/lang.taxi.Dummy/0.2.0/taxi.conf).

Dependencies are downloaded from a 





