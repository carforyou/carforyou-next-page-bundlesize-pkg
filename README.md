# CAR FOR YOU Page-level bundle size check for next.js

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage
```
npm install @carforyou/next-page-bundlesize -D
next build
npx next-page-bundlesize --maxSize="200 kB" --buildDir=.next
```

When using [`@carforyou/configuration`](https://github.com/carforyou/carforyou-configuration-pkg/) and using a stage-specific build dir:
```
npx next-page-bundlesize --buildDir=.next-$CONFIG_ENV --maxSize="230 kB"
```

If you want to compare your bundles against a previous config and use the fallback maxSize for new pages, you can define it as follows:
```
npx next-page-bundlesize --buildDir=.next-$CONFIG_ENV --maxSize="230 kB" --previousConfigFileName=bundlesize.json
```

The file must be located under `buildDir/previousConfigFileName`. The script creates an updated version `buildDir/new-previousConfigFileName`

## Development
```
npm run build
```

You can link your local npm package to integrate it with any local project:
```
cd carforyou-next-page-bundlesize-pkg
npm run build

cd carforyou-listings-web
npm link ../carforyou-next-page-bundlesize-pkg/pkg
```

## Release a new version

New versions are released on the ci using semantic-release as soon as you merge into master. Please
make sure your merge commit message adheres to the corresponding conventions.


## Circle CI

You will need to enable the repository in circle CI ui to be able to build it.

For slack notifications to work you will need to provide the token in circle settings.
