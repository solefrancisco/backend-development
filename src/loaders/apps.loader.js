function mountSubApp(mainApp, options) {
    const {appName, enabled, mountPath, buildDependencies, createApp} = options;

    if (!enabled) {
        console.log(`[centralizer] ${appName} disabled`);
        return;
    }

    const dependencies = buildDependencies();
    const subApp = createApp(dependencies);

    mainApp.use(mountPath, subApp);

    console.log(`[centralizer] ${appName} mounted on "${mountPath}"`);
}

module.exports = { mountSubApp };