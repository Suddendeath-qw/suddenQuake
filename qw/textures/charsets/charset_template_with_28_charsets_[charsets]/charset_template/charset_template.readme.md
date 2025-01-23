
   Title: Charset Template
    Type: Charset 512x512

  Author: Michał Sochoń
Nickname: `_KaszpiR_`
 Contact: kaszpir@gmail.com or _KaszpiR_ @ quakenet / Discord

    Date: 2022.12.28, 23:30
 Version: 1.3
 License: Creative Commons

  Format: Mixed, png, Adobe Photoshop .psd files.

# Changelog

## 1.3

- move files to qw/textures/charsets/ subdirectory

## 1.2

- save lucida console as separate file
- fixed lucida console so that it does not have so many artifacts from adjacent letters
- fixed lucida console big color squares (now are solid color), small color squares, slider, arrow
- fixed lucida console vertical position and size of: `, g, j, {, }

## 1.1

- fixed Georgia missing W letters (had to make font smaller from 30ps to 27/26pt)

## 1.0

- initial release

# Notes

I got tired of existing charsets. Also none of available files on gfx.qw.nu had source.
So I did a .psd file, which allows you to edit every letter separately.
To make editing a bit easier thus layers are in groups per row, 16 in total.

# Installation

- extract the zip
- put contents of `qw/` directory in the same place as your `qw/` dir, for example `~/nquake/qw/`
- in game console type `exec charset_template.cfg` and then keys PageUp and PageDn will rotate across the fonts in this package.
- if you like given font then type `gl_consolefont` in the console and it will show currently loaded file. Save it to your config.

# Changing font

You will require Adobe Photoshop CC.
If you do not have it then ask for help on [QW dev-corner](https://discord.com/channels/166866762787192833/179895022366228481) discord server.

If you want to change font for all of them:

- go to Layers
- select type Text (older Adobe Photoshop versions do not have that option)
- in the list below select all layers you want to change
- in the Properties (or better Character) window set desired font
- wait till Photoshop applies the change to every layer (it usually takes some seconds)
- adjust font Baseline Shift to negative values more/less if letters are misplaced especially if using faux bold.

# Known limitations

- altering color requires applying changes to the group per row
- some fonts have really strange baselines and they need adjustments more.
- .psd contains some old crap from font graybugs, I was lazy and tired.
- adjust font Baseline Shift for
   - Arial Faux Bold
- some fonts are super weird, for example
   - Constantia, has numbers with different baseline
