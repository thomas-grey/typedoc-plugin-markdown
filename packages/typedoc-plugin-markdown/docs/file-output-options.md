# File output options

TypeDoc creates documentation according to exports. The modules strucutre will be driven by the implemented an entry point config. https://typedoc.org/guides/options/#entrypointstrategy.

The plugin aims to provide some flexibility as to how files can be generated.

### Output folder structure

By default the file structure is generated as per module path structure and then reflections.

#### Example

```
├── README.md
│ ├── moduleA
|    ├── classes
|      ├── ClassA.md
│    ├── interfaces
|      ├── InterfaceA.md
│ ├── moduleB
|    ├── classes
|      ├── ClassA.md
│    ├── interfaces
|      ├── InterfaceA.md
```

## Configuring how files are generated

By default all exported reflections are contained in their own file as per the HTML theme. Modules and namespaces always have a file in their own scope, however configuring what reflections are hoisted onto the module file can be configured with the `kindsWithOwnFile` option.

All reflections can be hoisted onto a single module/namespace file with `None`, or to defined at a granular level the option accepts an array of the following types of reflections.

- `Class` - reflections which represent a class.
- `Interface` - reflections which represent an interface
- `TypeAlias` - reflections which represent a type alias
- `Enumeration` - reflections which represent an enum.
- `Function` - reflections which represent a function's or method's signatures.
- `Variable` - reflections which represent a variable.

### Examples

The following will create seperate files for classes and interfaces only.

```bash
--kindsWithOwnFile class --kindsWithOwnFile Interface
```

_Note when definiting arrays using a json options file is less verbose:_

```js
{
  kindsWithOwnFile: ['Class', 'Interface'];
}
```

To hoist all reflections onto the module document can be achieved with the `none` options. If exporting from a single entrypoint this will effectively result in a single file documentation.

```bash
--kindsWithOwnFile none
```

The result will be all reflections are documented onto a single module file:

```
├── README.md
│── moduleA.md
│── moduleB.md
```