import { type RouteConfig, index } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    {
        path: 'redirect',
        file: 'routes/redirect.tsx',
    },

    // Bloome routes
    {
        path: ':userID/onBoarding',
        file: 'routes/bloome/onboarding/page.tsx',
    },
    {
        path: ':userID/dashboard',
        file: 'routes/bloome/dashboard/page.tsx',
    },
    {
        path: ':userid/settings',
        file: 'routes/bloome/settings/page.tsx',
    },
    {
        path: ':userid/studio-manager',
        file: 'routes/bloome/admin/studioManager/page.tsx',
    },
    {
        path: ':userid/:classID/studio',
        file: 'routes/bloome/studio/page.tsx',
    },

    // Forge routes
    /*
    {
        path: ':userid/:classid/forge/',
        file: 'routes/forge/' // Update later on
    },
    */
] satisfies RouteConfig;
