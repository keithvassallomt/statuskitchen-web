/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "statuskitchen-web",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.StaticSite("Web", {
      domain: $app.stage === "production" ? "statuskitchen.app" : undefined,
      build: {
        command: "npm run build",
        output: "dist",
      },
    });
  },
});
