A Pen created at CodePen.io. You can find this one at https://codepen.io/jkantner/pen/wdzYNr.

 A mini 2D virtual world with a command line made to be like the one in Minecraft. Manipulate JS-controlled chibis as well as your own (name in yellow) by using commands to change appearance and stats, teleport them somewhere else, or you can spawn more if you’d like! Since I wasn’t focused too much on AI for this demo, the JS-controlled chibis just move around randomly and send emojis. I have tab suggestions only working for required arguements.

### Controls and Hotkeys
|Action|Key|
|---|---|
|Move|all arrow keys|
|Navigate own chat input history|up and down arrow keys|
|Get suggestions for command arguments|Tab|
|Open chat|V|
|Open chat with command started|/|
|Exit chat|Esc|

### Commands
* /clear - clear chat
* /help - get help menu
* /entityinfo &lt;*name*> - get details of entity
* /modentity &lt;*name*> &lt;*newname*> [*gender*] [*skin*] [*speed*] [*level*] - modify entity
* /npc &lt;add|del> &lt;*name*> [*gender*] [*skin*] [*speed*] [*level*] [&lt;*x*> &lt;*y*>] - add/delete NPC
* /tp &lt;*name*> &lt;*x*> &lt;*y*> or &lt;*name*> &lt;*targetname*> - teleport entity to new location
* /who - get list of all entities

#### Accepted Values for Certain Arguments
|Argument|Values
|---|---|
`gender`|`0` and `1`, `m` and `f`, or `male` and `female`
`skin`|0-2
`speed`|0-9
`level`|0-20

Browser support note: SVG grass background doesn’t work properly in Safari. Nothing works in IE.