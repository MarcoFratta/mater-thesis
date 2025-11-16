# Alchemist Simulator - Kotlin DSL Context

## Overview
The Alchemist simulator currently uses YAML files for configuration, but there's a need to build a Kotlin DSL to replace YAML with a more type-safe and IDE-friendly approach. The goal is to support all existing YAML syntax incrementally, starting with simple examples.

## Current Architecture

### Loading System
The loading system is built around several key components:

1. **AlchemistModelProvider Interface**: Defines how different file formats are processed
   - `YamlProvider`: Processes YAML files using SnakeYAML
   - Currently no Kotlin provider exists

2. **LoadAlchemist Object**: Main entry point for loading simulations
   - Uses `ClassPathScanner` to find providers by file extension
   - Delegates to appropriate provider based on file extension
   - Applies overrides and converts to `SimulationModel`

3. **SimulationModel Object**: Core translation engine
   - Converts Map<String, *> (from YAML/DSL) to executable `Loader`
   - Handles variable resolution, dependency injection, and object construction
   - Uses `Context` for variable management and object factory

4. **Loader Interface**: Final result that can create simulations
   - Contains variables, constants, dependent variables
   - Can create `Simulation<T, P>` instances with different variable values

### YAML Structure Analysis

#### Basic Structure
```yaml
incarnation: sapere  # Required - defines the simulation type
network-model:       # Optional - defines how nodes connect
  type: ConnectWithinDistance
  parameters: [0.5]
deployments:         # Optional - defines node placement
  type: Grid
  parameters: [-5, -5, 5, 5, 0.25, 0.25, 0.1, 0.1]
```

#### Key Sections
1. **incarnation**: Required string identifying simulation type (sapere, protelis, scafi, etc.)
2. **network-model**: Defines linking rules between nodes
3. **deployments**: Defines where and how nodes are placed
4. **variables**: Free and dependent variables for batch simulations
5. **environment**: Custom environment configuration
6. **export**: Data export configuration
7. **monitors**: Output monitoring configuration
8. **seeds**: Random number generator seeds

#### Complex Examples
```yaml
# Content deployment with filters
deployments:
  type: Grid
  parameters: [-5, -5, 5, 5, 0.25, 0.25, 0.1, 0.1]
  contents:
    - molecule: hello
    - in:
        type: Rectangle
        parameters: [-1, -1, 2, 2]
      molecule: token

# Programs with time distributions
programs:
  - time-distribution: 1
    program: >
      {token} --> {firing}
  - program: "{firing} --> +{token}"

# Variables
variables:
  myvar:
    min: 0.0
    max: 1.0
    default: 0.5
    step: 0.1
```

### Existing Kotlin DSL Examples

The codebase already contains some Kotlin DSL examples in test resources:

```kotlin
// Minimal example
simulation {
    incarnation = SapereIncarnation()
}

// With environment
simulation {
    incarnation = ProtelisIncarnation()
    environment {
        type = Continuous2DEnvironment()
    }
}

// With variables
simulation {
    incarnation = SapereIncarnation()
    variables {
        "myvar" to LinearVariable(0.0, 0.0, 1.0, 0.2)
    }
}

// With deployments
simulation {
    incarnation = SapereIncarnation()
    networkModel = ConnectWithinDistance(5.0)
    deployments {
        point {
            parameters(0.0, 0.0)
        }
        point {
            parameters(0.0, 1.0)
        }
    }
}

// With content
simulation {
    incarnation = SapereIncarnation()
    networkModel = ConnectWithinDistance(0.5)
    deployments {
        grid {
            parameters(-5.0, -5.0, 5.0, 5.0, 0.25, 0.25, 0.1, 0.1)
            contents {
                content {
                    molecule = "hello"
                }
                content {
                    filter = Rectangle(-1.0, -1.0, 2.0, 2.0)
                    molecule = "token"
                }
            }
        }
    }
}
```

### Key Components to Implement

1. **KotlinProvider**: New `AlchemistModelProvider` for `.kt` files
   - Should execute Kotlin DSL code and return `Map<String, *>`
   - Needs to handle Kotlin scripting or compilation

2. **DSL Builder Functions**: Type-safe builders for simulation configuration
   - `simulation { }` - main builder
   - `deployments { }` - deployment configuration
   - `variables { }` - variable definitions
   - `environment { }` - environment configuration
   - `export { }` - export configuration

3. **Type-Safe Constructors**: Replace YAML string-based type references
   - `SapereIncarnation()` instead of `"sapere"`
   - `ConnectWithinDistance(0.5)` instead of YAML object with type/parameters
   - `LinearVariable(min, max, default, step)` instead of YAML object

### Implementation Strategy

1. **Phase 1**: Create basic KotlinProvider and minimal DSL
   - Support basic simulation with incarnation
   - Support simple deployments (Point, Circle, Grid)
   - Support basic variables

2. **Phase 2**: Add content and programs
   - Support molecule content deployment
   - Support position filters
   - Support program definitions

3. **Phase 3**: Add advanced features
   - Support environment configuration
   - Support export configuration
   - Support monitors and seeds

4. **Phase 4**: Full feature parity
   - Support all YAML features
   - Add type safety improvements
   - Add IDE support features

### Technical Considerations

1. **Kotlin Scripting**: Use `kotlin-scripting-jsr223` for executing DSL code
2. **Type Safety**: Leverage Kotlin's type system for better IDE support
3. **Backward Compatibility**: Ensure DSL produces same `Loader` as YAML
4. **Performance**: Consider compilation vs interpretation trade-offs
5. **Error Handling**: Provide clear error messages for DSL syntax errors

### File Structure
```
alchemist-loading/src/main/kotlin/it/unibo/alchemist/
├── boundary/
│   ├── modelproviders/
│   │   ├── YamlProvider.kt
│   │   └── KotlinProvider.kt (to be created)
│   └── dsl/ (to be created)
│       ├── SimulationBuilder.kt
│       ├── DeploymentBuilder.kt
│       ├── VariableBuilder.kt
│       └── EnvironmentBuilder.kt
```

### Dependencies
- `kotlin-scripting-jsr223` for Kotlin script execution
- Existing Alchemist classes for type-safe constructors
- `SimulationModel.fromMap()` for final conversion to `Loader`

This context provides the foundation for building a comprehensive Kotlin DSL that maintains full compatibility with the existing YAML system while providing better type safety and IDE support.


