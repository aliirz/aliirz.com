# aliirz.com

Ali Raza's blog. Jekyll 4.3, built by GitHub Actions and published to GitHub Pages.

The layout is a single monospace column in the spirit of [no-style-please](https://github.com/riggraz/no-style-please) (MIT, see `assets/css/no-style-please.LICENSE.txt`). Light and dark colors follow `prefers-color-scheme` until the small header switch is clicked. A click cycles light, dark, and back to the system setting. Code uses Rouge, with a separate dark palette.

```
bundle install
bundle exec jekyll serve
```

Posts live in `_posts` and keep the `/:title` permalink. Tag pages, the RSS feed, the sitemap, and Google Analytics stay wired in `_config.yml`. Old `/page/2/` through `/page/16/` addresses redirect to the homepage. `/search.json` is an empty list so that previous URL still resolves.

Kudos are a hold-to-fill button at the end of a post. Counts need `kudos_endpoint` in `_config.yml`. The serverless function is in `kudos-api/` and is not part of the Jekyll build. Setup is in `kudos-api/README.md`.
