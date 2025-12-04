interface Loader : Serializable {

    val constants: Map<String, Any?>
    val remoteDependencies: List<String>
    val launcher: Launcher
    val dependentVariables: Map<String, DependentVariable<*>>
    val variables: Map<String, Variable<*>>

    fun <T, P : Position<P>> getDefault(): Simulation<T, P>
    fun <T, P : Position<P>> getWith(values: Map<String, *>): Simulation<T, P>
    fun launch(launcher: Launcher = this.launcher): Unit
}