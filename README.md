# Clases de Español: site d'inscription

A static site (HTML, CSS, JavaScript) for GitHub Pages. White, orange and black, inspired by a paperback book cover.

## Files

- `index.html`: the page (course, levels, programme, calendar, registration form)
- `style.css`: the design
- `script.js`: builds the programme table and calendar, and sends the form to your e-mail

## Put it online with GitHub Pages

1. Create a repository on GitHub (for example `espagnol`, or `YOUR-USERNAME.github.io` for the root address).
2. Upload `index.html`, `style.css` and `script.js` to the root of the repository.
3. Go to **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After about a minute, the site is live at `https://YOUR-USERNAME.github.io/espagnol/`.

## Make the form send e-mails (important)

The form uses [FormSubmit](https://formsubmit.co), a free service that forwards submissions to britelyassine47@gmail.com.

1. Open your **live** site (not the file on your computer) and submit the form once with test data.
2. FormSubmit sends an **activation e-mail** to britelyassine47@gmail.com. Click the link in it (check spam if you don't see it).
3. From then on, every registration arrives in your inbox as a table.

Recommended: the activation e-mail also gives you a random alias. Replace the address in `FORM_ENDPOINT` at the top of `script.js` with the alias (`https://formsubmit.co/ajax/ALIAS`) and in the `action` of the `<form>` in `index.html` (`https://formsubmit.co/ALIAS`). That way your e-mail address no longer appears in the public code.

Note: registrations pass through FormSubmit's servers. The form mentions this, which is useful for GDPR.

## Changing the course

At the top of `script.js` you can edit:

- `START`: first Monday of the course
- `HOLIDAYS`: public holidays (the Beginners session is moved to Friday)
- `BEG` / `INT`: session titles for each group

The programme table and calendar update automatically. Also update the dates written in `index.html` (start and end dates, 11 November note) and the footer if you change `START`.

## Before publishing

- Add the price if you want it shown (a line in the "Informations pratiques" list).
- Check the room at Campus 1 and the start date.
