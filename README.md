# CV

Source for https://cv.daniel.tools - my curriculum vitae.

It is a Jekyll site that GitHub Pages builds from the `main` branch, root path. The layout comes from the `sproogen/modern-resume-theme` remote theme; I do not keep a copy of the theme files here. Almost all the content (roles, dates, skills, links) is in `_config.yml`. `index.md` is only a stub with front matter, and `assets/main.scss` only imports the theme. The custom domain is set by `CNAME` and served through Cloudflare.

Local preview:

    bundle install
    bundle exec jekyll serve

There are no analytics and no tracking scripts.
