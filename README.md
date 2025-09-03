# 🦕 Dinosaur Directory - Astro + Deno Tutorial

A simple dinosaur reference app built with Astro and running on Deno. This tutorial demonstrates the basics of building and deploying a static site with dynamic routing using modern web technologies.

## 📖 What This App Does

- **Browse Dinosaurs**: View a directory of prehistoric creatures
- **Individual Pages**: Click any dinosaur to see detailed information
- **Dynamic Routing**: Uses Astro's file-based routing with slugs
- **Clean Architecture**: Separates data, logic, and presentation

## Make It Your Own

You can deploy your own version of this Astro app to Deno Deploy immediately. Just click the button to clone and deploy.

[![Deploy on Deno](https://deno.com/button)](https://app.deno.com/new?clone=https://github.com/denoland/tutorial-with-astro)

## 🚀 Quick Start

```sh
# Clone or create this project
deno create astro@latest -- --template minimal

# Install dependencies
deno install

# Start development server
deno dev
```

Visit `http://localhost:4321` to see your dinosaur directory!

## 🏗️ Project Structure

This tutorial app demonstrates a clean, scalable architecture:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   └── data.json          # Dinosaur data (973 entries!)
│   ├── lib/
│   │   └── dinosaur-service.ts # Business logic & utilities
│   ├── pages/
│   │   ├── index.astro        # Homepage with dinosaur list
│   │   └── dinosaur/
│   │       └── [slug].astro   # Dynamic routes for each dinosaur
│   └── styles/
│       └── index.css          # Shared styles
├── package.json
└── README.md
```

### Key Concepts Demonstrated

- **File-based Routing**: Each `.astro` file in `src/pages/` becomes a route
- **Dynamic Routes**: `[slug].astro` creates pages for each dinosaur automatically  
- **Static Site Generation**: All pages are pre-built at build time
- **Service Layer**: Clean separation of data access logic
- **External CSS**: Organized styling in separate files

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `deno install`         | Installs dependencies                            |
| `deno dev`             | Starts local dev server at `localhost:4321`      |
| `deno build`           | Build your production site to `./dist/`          |
| `deno preview`         | Preview your build locally, before deploying     |
| `deno astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `deno astro -- --help` | Get help using the Astro CLI                     |

## 🦴 How It Works

1. **Data Management**: Dinosaur information is stored in `src/data/data.json`
2. **Service Layer**: `DinosaurService` handles data access and URL slug generation
3. **Homepage**: Lists all dinosaurs as clickable links using Astro's templating
4. **Dynamic Pages**: Each dinosaur gets its own page via `[slug].astro` routing
5. **Static Generation**: At build time, Astro creates individual HTML files for each dinosaur

## 🎯 Tutorial Goals

This project teaches you:

- How to structure an Astro application
- Working with static data in JSON format
- Creating dynamic routes with static site generation
- Organizing CSS and maintaining clean code architecture
- Running Astro applications on Deno instead of Node.js

## 👀 Want to learn more?

Check out [the Astro documentation](https://docs.astro.build) or the [Deno documentation](https://docs.deno.com).

---

This is a tutorial project demonstrating Astro + Deno basics with a fun dinosaur theme! 🦕
