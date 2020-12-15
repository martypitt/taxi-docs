# Plugins

Plugins define how a compiled taxi document will be processed.  Typically, this involves creating models in some language.

{% hint style="info" %}
Currently, there's only a single generator provided - the Kotlin generator.  However, the plugin system of Taxi is evolving rapidly, and we intend to support loading externally provided plugins.
{% endhint %}

Plugins can be used to output a taxi model in a specific language - or to modify the source from a generator.

Plugins are either packaged internally with Taxi, or you can write your own, which can be dowloaded and included.

See [Writing your own plugins](writing-your-own-plugins.md).

### Declaring a plugin

Plugins are declared in the `plugins` section of the `taxi.conf` file.  Declare the name of the plugin to enable, followed by configuration options for that plugin

```text
plugins: {
    'taxi/kotlin' {  // Name of the plugin
        // plugin config goes here
    }
}
pluginSettings: { // Optional
    repositories: [
        'http://your-plugin-repository-url'
    ]
    localCache: '~/.taxi.plugins' 
}
```

### Configuring a plugin

Each plugin determines it's own configuration.  The `PluginWithConfig<T>` interface defines the type of config that a plugin will consume.  For an example, check out the [Kotlin plugin](https://gitlab.com/taxi-lang/taxi-lang/-/blob/develop/taxi-cli/src/main/java/lang/taxi/cli/plugins/internal/KotlinPlugin.kt).

