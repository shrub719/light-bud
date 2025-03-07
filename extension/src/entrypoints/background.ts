export default defineBackground({
    persistent: true,
    main() {
        console.log("hello from background.ts!", { id: browser.runtime.id });
    },
});