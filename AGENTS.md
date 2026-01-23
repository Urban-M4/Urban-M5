# Urban-M5

Web application to look at and change [streetscapes](https://github.com/stefanv/streetscapes) data.

## Usage

In normal usage you would start the streetscapes server and than follow the link it prints.

# Development

```shell
pnpm i # install dependencies
pnpm dev # start development server
pnpm build # build for production
pnpm format # format code with prettier
pnpm lint # run eslint
pnpm typecheck # run TypeScript type checking
```

## Important

- when you make changes to code, make sure to format, lint and typecheck
- shadcn/ui for components,
  - only put shadcn components in the `src/components/ui/` folder.
  - use lucide icons
- pnpm as package manager
- tailwindcss for styling
- nuqs for state management
