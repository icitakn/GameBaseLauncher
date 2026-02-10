# GameBase Launcher

An Electron application built with React and TypeScript for managing GameBases (like this one: https://gb64.com/). This app is designed to replace the old Access database format (.mdb) with a new Sqlite database (.db). In the first version the new database structure looks almost the same like the old. Also, in this first version several features that come with "The GameBase Frontend" (see https://www.bu22.com/) are not implemented yet, like GEMUS. Ideas for improvements and new features are welcome.

Also, feel free to fork this repo and create an app managing something completely different with it.

Runs on Windows, Mac and Linux.

## How to run

On Windows you can either download and run the pre-built release or clone the repo and build it yourself.
On Mac and Linux, please build it yourself. I plan to upload a pre-built release with the next release for these systems as well.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 22 or lower (v22.x recommended)
  - ⚠️ **Important**: Versions higher than v22 are currently not supported
  - Download from [nodejs.org](https://nodejs.org/)

- **Python**: Version 3.11 exactly
  - ⚠️ **Important**: Higher versions (3.12+) are currently not compatible with the build process
  - Download from [python.org](https://www.python.org/downloads/)

- **npm**: Comes bundled with Node.js

### Version Verification

After installation, verify your versions:

```bash
node --version   # Should show v22.x.x or lower
python --version # Should show 3.11.x
npm --version    # Any recent version
```

## Installation

1. **Clone the repository** (or extract the project files)

   ```bash
   git clone <repository-url>
   cd GameBaseLauncher
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This command will also automatically run `electron-builder install-app-deps` via the postinstall script.

## Development

### Running in Development Mode

Start the application in development mode with hot-reload:

```bash
npm run dev
```

### Code Quality

Run the linter to check code quality:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

## Building

### Build for Development

Build the application without packaging:

```bash
npm run build
```

### Build and Package

Build unpacked directory (for testing):

```bash
npm run build:unpack
```

Build for specific platforms:

```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Additional Commands

### Preview Built Application

Preview the production build:

```bash
npm start
```

### Generate License Information

Generate a file containing all dependency licenses:

```bash
npm run generate-licenses
```

## Project Structure

- **Main Process**: Electron main process code
- **Renderer Process**: React application
- **Preload Scripts**: Electron preload scripts for secure IPC

## Technology Stack

- **Electron**: Desktop application framework
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **MikroORM**: TypeScript ORM with SQLite
- **Material-UI**: React component library
- **TanStack Table**: Powerful table component
- **React Hook Form**: Form management
- **i18next**: Internationalization

## Troubleshooting

### Python Version Issues

If you encounter build errors related to native modules:

1. Ensure Python 3.11 is installed
2. Make sure Python 3.11 is in your system PATH
3. You may need to set the Python path explicitly:
   ```bash
   export PYTHON=/path/to/python3.11
   ```

### Node.js Version Issues

If you have multiple Node.js versions installed:

1. Consider using a version manager like [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows)
2. Switch to Node.js v22:
   ```bash
   nvm install 22
   nvm use 22
   ```

## License

See the project's license file for details. Use `npm run generate-licenses` to generate a complete list of all dependency licenses.

## Support

For issues and questions, please refer to the project's issue tracker or documentation.
