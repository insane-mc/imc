<br>
<p align="center">
	<img align="center" src="./assets/logo.png">
</p>

<img src="https://tokei.rs/b1/github/insane-mc/imc">

## Introduction

> This project is still under development, API interfaces may be unstable or not supported yet.



## Supported Features


### MC Lang (Building)

Have you ever wanted make your code reusable? Have you ever dreamed of declaring `mcfunction`s with parameters? Have you ever been confused by the messy directories of Minecraft Datapacks?

Now introducing a new scripting language - IMC Lang, here is an example.

```plain
def tell($a) {
	tellraw @s {"text": $a}
}
@load {
	$tell("Hello,")
	$tell("World!")
}
```

What this code snippet does is make your datapack output `Hello, World!` each time it has loaded.

See [API Document](#) for more syntax.


### Context

To better organize your code and JSON files, we provide the context feature, that to help you pass namespace, directory, or other data via chaining calls.

For example, when you call `ctx.dir('xxx')` that `ctx` is a context, it will return a new context with directory set to `xxx`. When you declare functions or recipes, for example, using the returned context, they will be created in folder `xxx`.

We also implement a event system depended on context, to make you set callback functions or load/loop commands easily.


### Recipe

Enjoy better custom crafting! You can add recipes whose product contains NBT data, and even set the number of times limit for it. We will automatically convert it to datapacks through the advancement trick.

We could even pack all your recipes into a recipe book, then you could simply use commands to give it to other players.


### Advancement

The advancement feature is basically the same as it in vanilla Minecraft Datapacks, except that it's easier to create callbacks via our event system.

Of course, this is because our project is under development and we will bring more interesting features soon.
