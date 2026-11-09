# Random Password Generator

A one-page website that makes strong random passwords. Choose the length and the kinds of characters, then copy the result. The password is made in your browser and is never saved or sent anywhere.

The repository also has the original Python version, `Random Password Generator.py`, which prints a password in the terminal.

## Features

- Length from 4 to 64 characters, with a slider and a number box
- Switches for lowercase letters, uppercase letters, numbers and symbols
- Every kind you switch on appears at least once in the password
- Optional field for your own word, such as a name, placed at the start, the end or anywhere in the password
- Option to leave out look-alike characters (`I l 1 | O 0 o`)
- Strength meter that shows how many bits of randomness the password has
- Numbers and symbols in their own colors, so the password is easier to read
- One-click copy, with a fallback when the browser blocks the clipboard
- Light and dark themes: follows your system setting until you use the theme button, then remembers your choice
- Responsive layout for phones, tablets and desktops, with large buttons for touch screens

## Run it

### Website

Double-click `index.html` to open it in your browser. There is nothing to install or build. The fonts load from Google Fonts, and the page still works without them. JavaScript must be turned on, and the page shows a message if it isn't.

To see an edit, save the file and refresh the browser tab.

### Python version

```bash
python "Random Password Generator.py"
```

To change the length, edit `password_length` in the file.

## How the project is organized

| File | What it controls |
|---|---|
| `index.html` | The page structure and all the text you see |
| `style.css` | Colors, fonts, spacing and layout |
| `script.js` | How passwords are made, plus the settings, copy button and theme button |
| `favicon.svg` | The icon in the browser tab |
| `Random Password Generator.py` | The terminal version |

Keep the website files in the same folder, because `index.html` loads the others from there.

## Make your own changes

### Change the colors

Edit the values at the top of `style.css`:

| Name | Used for |
|---|---|
| `--bg` | Page background |
| `--surface` | Generator panel |
| `--sunken` | Dark box behind the password |
| `--on-sunken` | Letters in the password |
| `--ink` | Main text |
| `--muted` | Secondary text |
| `--line` | Borders and dividers |
| `--accent` | Copy button, switches, slider and links |
| `--on-accent` | Text on the Copy button |
| `--digit` | Numbers in the password |
| `--symbol` | Symbols in the password |
| `--word` | Your own word in the password |
| `--weak`, `--fair`, `--strong` | Strength meter colors |

The dark theme has its own copy of these colors. It appears **twice**, right below the light colors, so change both copies.

### Change the fonts

1. Choose fonts on [Google Fonts](https://fonts.google.com) and copy the stylesheet link it gives you.
2. Replace the `fonts.googleapis.com/css2` link in the `<head>` of `index.html`.
3. Put the new font names in `--font-display`, `--font-body` and `--font-mono` at the top of `style.css`.

Keep a monospace font for `--font-mono`, so look-alike characters stay easy to tell apart.

### Change the text

Search for the words you want to change and edit them in `index.html`:

- **Headline and intro:** the `<h1>` and `<p class="lead">`
- **Tips:** the three `<article>` blocks inside `<section class="notes">`
- **Footer:** the `<footer>`

The browser tab title and the search description are the `<title>` and `<meta name="description">` in the `<head>`.

### Change the password settings

These are under `Settings` at the top of `script.js`:

| Setting | Meaning |
|---|---|
| `CHARACTER_SETS` | The characters in each kind. Remove a symbol here if a site doesn't accept it |
| `LOOK_ALIKES` | Characters removed when "Leave out look-alike characters" is on |
| `MIN_LENGTH`, `MAX_LENGTH` | Shortest and longest length allowed |
| `STRENGTH_LEVELS` | The bits needed for each strength label |
| `MIN_RANDOM_WITH_WORD` | Fewest random characters kept next to your own word |
| `COPIED_TIME` | How long the Copy button says "Copied", in milliseconds |

If you change `MIN_LENGTH` or `MAX_LENGTH`, also change `min` and `max` on the `<input id="length">` and `<input id="length-number">` lines in `index.html`. To change the starting length, edit `value="16"` on both of those lines.

### Add a kind of character

1. Add a switch next to the others in `index.html`:

   ```html
   <label class="toggle"><input type="checkbox" data-set="spaces"><span class="track"></span>Spaces</label>
   ```

2. Add a matching entry to `CHARACTER_SETS` in `script.js`, using the same name as `data-set`:

   ```js
   spaces: ' ',
   ```

Leave out `checked` if the new kind should start switched off.

### Change the custom word field

- **Field:** it's in `<div class="word-field">` in `index.html`. The `maxlength="24"` on the `<input id="word">` line sets the longest word allowed.
- **Start, Anywhere and End:** these are the three `name="place"` buttons next to it. To change which one is picked first, move `checked` to another of them.
- **Behavior:** `addWord` in `script.js` puts the word into the password. The word counts toward the length. If it doesn't leave room for `MIN_RANDOM_WITH_WORD` random characters, the password grows and the note under the field says so.

### How strength is measured

The page multiplies the length by `log2` of the number of possible characters. The result is the bits of randomness: each extra bit doubles the guesses an attacker needs. The default 16 characters with every kind switched on gives about 105 bits.

Your own word isn't counted, because people often pick words an attacker could guess, such as names. The meter shows the strength of the random characters only.

### Change the theme button

- **Button:** it's in the `<header>` of `index.html`, and its style is under `.theme-switch` in `style.css`.
- **Behavior:** the code is under `Dark theme button` in `script.js`. The choice is saved in the browser under the name `pw-theme`.
- **Saved theme on load:** the small `<script>` in the `<head>` of `index.html` applies the saved choice. It stays there, not in `script.js`, so the wrong theme doesn't flash while the page loads.

### Change the layout on small screens

The layout rules are at the end of `style.css`:

- **`max-width: 700px`:** tablets and phones, where the tips stack into one column
- **`max-width: 520px`:** phones, where the buttons go under the password and the switches stack

## Why the passwords are safe

Both versions use a secure random generator: `crypto.getRandomValues` in the browser and the `secrets` module in Python. Python's `random` module, and JavaScript's `Math.random`, are made for games and simulations, and their results can be predicted, so don't use them for passwords.

## Test your changes

Before publishing:

1. Try the shortest and longest lengths, and type a number outside the range into the length box.
2. Switch the kinds of characters on and off, including all of them off.
3. Type a word, try Start, Anywhere and End, and try a word longer than the chosen length.
4. Select **Copy** and paste the password somewhere to check it.
5. Try the page on a phone, or in a narrow window, in both themes.

## Publish your changes

```bash
git add .
git commit -m "Describe your change"
git push
```

To put the page online with GitHub Pages:

1. In the repository on GitHub, go to **Settings > Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder, then select **Save**.

After a minute or two, the page will be at:

```text
https://himanshupharswan.github.io/Random_Password_Generator/
```
