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

### Arguments
|                 Argument | Description                                                                                                                                                                                                                                                                                                                      | Default value |
|-------------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| --maxSize                | Max size for new pages. If no previous config is specified, it is applied for all pages.                                                                                                                                                                                                                                         | "200 kB"      |
| --buildDir               | Directory where your project is built.                                                                                                                                                                                                                                                                                           | ".next"       |
| --delta                  | Delta that is added to the new configuration file for the page size in KB.                                                                                                                                                                                                                                                       | 2             |
| --previousConfigFileName | If you want to compare the bundlesize against a previous configuration and not the maxSize. The file must be located under the buildDir `buildDir/previousConfigFileName`.  The package will create an updated configuration for further usage in the same directory `buildDir/new-previousConfigFileName` prefixed with `new`.  | -             |
| --targetSize             | If the page size is below the targetSize, it will use the targetSize for the new configuration (in KB).                                                                                                                                                                                                                          | 130           |

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
