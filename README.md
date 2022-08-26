<h2 align="center">IMC</h2>
<p align="center">An <strong>I</strong>nsane <strong>M</strong>inecraft <strong>C</strong>ompiler for Building Datapacks</p>
<br>

> **This project is under development and all API interfaces may be unstable or unsupported.**



### Supported Features


#### MC Lang (Building)

Have you ever wanted reusable of your code? Have you ever dreamed of declaring `mcfunction`s with parameters? Have you ever been confused by the messy directories of Minecraft Datapacks?

Now introducing a new scripting language -- MC Lang, here is a simple example.

```plain
def tell($a) {
	tellraw @s {"text": $a}
}
$tell("Hello,")
$tell("World!")
```

See [API Document](#) for more syntax.


#### Context

To better organize our code, we provide the context feature. You can pass namespace and directory data via Javascript chaining calls.

For example, when you call `ctx.dir('xxx')` that `ctx` is a context element, it will return a new context with directory set to `xxx`. When you declare functions via the returned context, they will be created in folder `xxx`.


#### Recipe

Enjoy better custom crafting! You can now add recipes whose product contains NBT data, and even set the number of times limit for it. IMC will automatically convert it to Minecraft Datapacks for you.
