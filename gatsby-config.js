const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        siteName: 'Taxi',
        pageTitle: 'Taxi docs',
        menuTitle: 'Taxi',
        gaTrackingId: 'UA-74643563-13',
        algoliaApiKey: '768e823959d35bbd51e4b2439be13fb7',
        algoliaIndexName: 'apollodata',
        baseUrl: 'https://www.apollographql.com',
        twitterHandle: 'apollographql',
        spectrumHandle: 'apollo',
        youtubeUrl: 'https://www.youtube.com/channel/UC0pEW_GOrMJ23l8QcrGdKSw',
        logoLink: 'https://www.apollographql.com/docs/',
        baseDir: 'docs',
        contentDir: 'source',
        ffWidgetId: '3131c43c-bfb5-44e6-9a72-b4094f7ec028',
        subtitle: 'Apollo Basics',
        description: 'How to use the Apollo GraphQL platform',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/',
        sidebarCategories: {
          null: ['index', 'intro/getting-started', 'intro/benefits', 'intro/platform'],
          Language: [
            'language-reference/projects-and-names',
            'language-reference/types-and-models',
            'language-reference/advanced-types',
            'language-reference/describing-services',
          ],
          'Development Tools': [
            'devtools/cli',
            'devtools/editor-plugins',
            'devtools/taxi-config',
            'devtools/testing-taxi',
            'devtools/ci-cd-pipelines',
          ],
          Resources: [
            '[Principled GraphQL](https://principledgraphql.com)',
            'resources/graphql-glossary',
            'resources/faq',
          ],
        },
      },
    },
  ],
};
