[Developer Guide](../README.md) / typedoc-plugin-remark

# typedoc-plugin-remark

"typedoc-plugin-remark" is a utility package that pipes output though specified remark plugins.

Package features include:

- Exposes some additional options to TypeDoc.
- Initializes a new remark processor and transform that syntax tree (mdast) using plugins.

## Modules

| Module | Description |
| ------ | ------ |
| [core](core/README.md) | The plugin entrypoint and bootstrapping of the plugin. |
| [options](options/README.md) | All plugin types are exported from this module. |
| [types](types/README.md) | All plugin types are exported from this module. |
