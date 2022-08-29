<br>

<!-- header begin -->
<p align="center">
	<img src="https://cdn.jsdelivr.net/gh/insane-mc/imc/assets/logo.png">
</p>
<p align="center">
	<img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat">
	<a href="https://github.com/insane-mc/imc/fork"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"></a>
	<a href="https://www.npmjs.com/package/insane-mc"><img src="https://badge.fury.io/js/insane-mc.svg"></a>
	<img src="https://tokei.rs/b1/github/insane-mc/imc">
	<img src="https://hits.dwyl.com/insane-mc/imc.svg?style=flat">
</p>
<!-- header end -->

## Introduction

> This project is still under development, API interfaces may be unstable or not supported yet.

[中文文档 Chinese Docs](https://imc.memset0.cn/)

## Usage

```shell
npm install insane-mc
```

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

See [API Document](https://imc.memset0.cn/syntax/) for more syntax.


### Context

To better organize your mcfunction and JSON files, we provide feature context, that can help you pass namespace, directory, and other data via chaining calls.

For example, when you call `ctx.namespace('xxx')` that `ctx` is a context, it will return a new context with namespace set to `xxx`. When you declare functions or recipes, for example, using the returned context, they will be automatically created in target namespace.

We also implement a event system depended on context, to make you set callback functions or load/loop commands easily.


### Recipe

Enjoy better custom crafting! You can add recipes whose product contains NBT data, and even set the number of times limit for it. We will automatically convert it to datapacks using advancement tricks.

We could even pack all your recipes into a recipe book, then you could simply use commands to give it to other players.


### Advancement

The advancement feature is basically the same as it in vanilla datapacks, except that it's easier to create callbacks via our event system.

Of course, this is because our project is under development and we will bring more interesting features soon.
