export default defineBackground({
    persistent: true,
    main() {
        console.log("hello from background.ts!", { id: browser.runtime.id });
        // TODO: when intialising extension, what if server isn't online/available?
        // TODO: dynamically load customisation options from server? so new hats don't need an extension update.
        // TODO: remember to sanitise data just in case
    },
});