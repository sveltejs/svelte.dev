// vite.config.ts
import { sveltekit } from "file:///Users/rich/Development/SVELTE/svelte.dev/node_modules/.pnpm/@sveltejs+kit@2.6.3_@sveltejs+vite-plugin-svelte@4.0.0-next.6_svelte@5.0.0-next.260_vite@5.4._pjp26hbud6h4zwnprrr2hawsca/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { enhancedImages } from "file:///Users/rich/Development/SVELTE/svelte.dev/node_modules/.pnpm/@sveltejs+enhanced-img@0.3.4_rollup@4.21.2_svelte@5.0.0-next.260_vite@5.4.7_@types+node@20.14.2_lightningcss@1.25.1_/node_modules/@sveltejs/enhanced-img/src/index.js";
import { browserslistToTargets } from "file:///Users/rich/Development/SVELTE/svelte.dev/node_modules/.pnpm/lightningcss@1.25.1/node_modules/lightningcss/node/index.mjs";
import browserslist from "file:///Users/rich/Development/SVELTE/svelte.dev/node_modules/.pnpm/browserslist@4.23.1/node_modules/browserslist/index.js";
var plugins = [
  enhancedImages(),
  // apply cross-origin isolation headers for tutorial when developing/previewing locally,
  // else web containers don't work and images don't load in the rollup iframe
  {
    name: "cross-origin-isolation-for-preview",
    configurePreviewServer: (server) => {
      server.middlewares.use((_, res, next) => {
        res.setHeader("cross-origin-opener-policy", "same-origin");
        res.setHeader("cross-origin-embedder-policy", "require-corp");
        res.setHeader("cross-origin-resource-policy", "cross-origin");
        next();
      });
    },
    configureServer: (server) => {
      server.middlewares.use((_, res, next) => {
        res.setHeader("cross-origin-opener-policy", "same-origin");
        res.setHeader("cross-origin-embedder-policy", "require-corp");
        res.setHeader("cross-origin-resource-policy", "cross-origin");
        next();
      });
    }
  },
  sveltekit()
];
if (!process.versions.webcontainer) {
  plugins.push(
    (await import("file:///Users/rich/Development/SVELTE/svelte.dev/node_modules/.pnpm/vite-imagetools@7.0.4_rollup@4.21.2/node_modules/vite-imagetools/dist/index.js")).imagetools({
      exclude: "content/**",
      defaultDirectives: (url) => {
        if (url.searchParams.has("big-image")) {
          return new URLSearchParams("w=640;1280;2560;3840&format=avif;webp;png&as=picture");
        }
        return new URLSearchParams();
      }
    })
  );
}
var config = {
  plugins,
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist([">0.2%", "not dead"]))
    }
  },
  build: {
    cssMinify: "lightningcss"
  },
  server: {
    fs: { allow: ["../../packages", "../../../KIT/kit/packages/kit"] },
    // for SvelteKit tutorial
    headers: {
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-embedder-policy": "require-corp",
      "cross-origin-resource-policy": "cross-origin"
    }
  },
  optimizeDeps: {
    exclude: ["@sveltejs/site-kit", "@sveltejs/repl", "@rollup/browser"]
  },
  ssr: {
    noExternal: ["@sveltejs/site-kit", "@sveltejs/repl"],
    external: ["shiki", "@shikijs/twoslash"]
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcmljaC9EZXZlbG9wbWVudC9TVkVMVEUvc3ZlbHRlLmRldi9hcHBzL3N2ZWx0ZS5kZXZcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9yaWNoL0RldmVsb3BtZW50L1NWRUxURS9zdmVsdGUuZGV2L2FwcHMvc3ZlbHRlLmRldi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvcmljaC9EZXZlbG9wbWVudC9TVkVMVEUvc3ZlbHRlLmRldi9hcHBzL3N2ZWx0ZS5kZXYvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZW5oYW5jZWRJbWFnZXMgfSBmcm9tICdAc3ZlbHRlanMvZW5oYW5jZWQtaW1nJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uLCBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBicm93c2Vyc2xpc3RUb1RhcmdldHMgfSBmcm9tICdsaWdodG5pbmdjc3MnO1xuaW1wb3J0IGJyb3dzZXJzbGlzdCBmcm9tICdicm93c2Vyc2xpc3QnO1xuXG5jb25zdCBwbHVnaW5zOiBQbHVnaW5PcHRpb25bXSA9IFtcblx0ZW5oYW5jZWRJbWFnZXMoKSxcblx0Ly8gYXBwbHkgY3Jvc3Mtb3JpZ2luIGlzb2xhdGlvbiBoZWFkZXJzIGZvciB0dXRvcmlhbCB3aGVuIGRldmVsb3BpbmcvcHJldmlld2luZyBsb2NhbGx5LFxuXHQvLyBlbHNlIHdlYiBjb250YWluZXJzIGRvbid0IHdvcmsgYW5kIGltYWdlcyBkb24ndCBsb2FkIGluIHRoZSByb2xsdXAgaWZyYW1lXG5cdHtcblx0XHRuYW1lOiAnY3Jvc3Mtb3JpZ2luLWlzb2xhdGlvbi1mb3ItcHJldmlldycsXG5cdFx0Y29uZmlndXJlUHJldmlld1NlcnZlcjogKHNlcnZlcikgPT4ge1xuXHRcdFx0c2VydmVyLm1pZGRsZXdhcmVzLnVzZSgoXywgcmVzLCBuZXh0KSA9PiB7XG5cdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ2Nyb3NzLW9yaWdpbi1vcGVuZXItcG9saWN5JywgJ3NhbWUtb3JpZ2luJyk7XG5cdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ2Nyb3NzLW9yaWdpbi1lbWJlZGRlci1wb2xpY3knLCAncmVxdWlyZS1jb3JwJyk7XG5cdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ2Nyb3NzLW9yaWdpbi1yZXNvdXJjZS1wb2xpY3knLCAnY3Jvc3Mtb3JpZ2luJyk7XG5cdFx0XHRcdG5leHQoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y29uZmlndXJlU2VydmVyOiAoc2VydmVyKSA9PiB7XG5cdFx0XHRzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChfLCByZXMsIG5leHQpID0+IHtcblx0XHRcdFx0cmVzLnNldEhlYWRlcignY3Jvc3Mtb3JpZ2luLW9wZW5lci1wb2xpY3knLCAnc2FtZS1vcmlnaW4nKTtcblx0XHRcdFx0cmVzLnNldEhlYWRlcignY3Jvc3Mtb3JpZ2luLWVtYmVkZGVyLXBvbGljeScsICdyZXF1aXJlLWNvcnAnKTtcblx0XHRcdFx0cmVzLnNldEhlYWRlcignY3Jvc3Mtb3JpZ2luLXJlc291cmNlLXBvbGljeScsICdjcm9zcy1vcmlnaW4nKTtcblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRzdmVsdGVraXQoKSBhcyBQbHVnaW5PcHRpb25cbl07XG5cbi8vIE9ubHkgZW5hYmxlIHNoYXJwIGlmIHdlJ3JlIG5vdCBpbiBhIHdlYmNvbnRhaW5lciBlbnZcbmlmICghcHJvY2Vzcy52ZXJzaW9ucy53ZWJjb250YWluZXIpIHtcblx0cGx1Z2lucy5wdXNoKFxuXHRcdChhd2FpdCBpbXBvcnQoJ3ZpdGUtaW1hZ2V0b29scycpKS5pbWFnZXRvb2xzKHtcblx0XHRcdGV4Y2x1ZGU6ICdjb250ZW50LyoqJyxcblx0XHRcdGRlZmF1bHREaXJlY3RpdmVzOiAodXJsKSA9PiB7XG5cdFx0XHRcdGlmICh1cmwuc2VhcmNoUGFyYW1zLmhhcygnYmlnLWltYWdlJykpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcygndz02NDA7MTI4MDsyNTYwOzM4NDAmZm9ybWF0PWF2aWY7d2VicDtwbmcmYXM9cGljdHVyZScpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblx0XHRcdH1cblx0XHR9KSBhcyBQbHVnaW5PcHRpb25cblx0KTtcbn1cblxuY29uc3QgY29uZmlnOiBVc2VyQ29uZmlnID0ge1xuXHRwbHVnaW5zLFxuXHRjc3M6IHtcblx0XHR0cmFuc2Zvcm1lcjogJ2xpZ2h0bmluZ2NzcycsXG5cdFx0bGlnaHRuaW5nY3NzOiB7XG5cdFx0XHR0YXJnZXRzOiBicm93c2Vyc2xpc3RUb1RhcmdldHMoYnJvd3NlcnNsaXN0KFsnPjAuMiUnLCAnbm90IGRlYWQnXSkpXG5cdFx0fVxuXHR9LFxuXHRidWlsZDoge1xuXHRcdGNzc01pbmlmeTogJ2xpZ2h0bmluZ2Nzcydcblx0fSxcblx0c2VydmVyOiB7XG5cdFx0ZnM6IHsgYWxsb3c6IFsnLi4vLi4vcGFja2FnZXMnLCAnLi4vLi4vLi4vS0lUL2tpdC9wYWNrYWdlcy9raXQnXSB9LFxuXHRcdC8vIGZvciBTdmVsdGVLaXQgdHV0b3JpYWxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnY3Jvc3Mtb3JpZ2luLW9wZW5lci1wb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuXHRcdFx0J2Nyb3NzLW9yaWdpbi1lbWJlZGRlci1wb2xpY3knOiAncmVxdWlyZS1jb3JwJyxcblx0XHRcdCdjcm9zcy1vcmlnaW4tcmVzb3VyY2UtcG9saWN5JzogJ2Nyb3NzLW9yaWdpbidcblx0XHR9XG5cdH0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdGV4Y2x1ZGU6IFsnQHN2ZWx0ZWpzL3NpdGUta2l0JywgJ0BzdmVsdGVqcy9yZXBsJywgJ0Byb2xsdXAvYnJvd3NlciddXG5cdH0sXG5cdHNzcjoge1xuXHRcdG5vRXh0ZXJuYWw6IFsnQHN2ZWx0ZWpzL3NpdGUta2l0JywgJ0BzdmVsdGVqcy9yZXBsJ10sXG5cdFx0ZXh0ZXJuYWw6IFsnc2hpa2knLCAnQHNoaWtpanMvdHdvc2xhc2gnXVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZWLFNBQVMsaUJBQWlCO0FBQ3ZYLFNBQVMsc0JBQXNCO0FBRS9CLFNBQVMsNkJBQTZCO0FBQ3RDLE9BQU8sa0JBQWtCO0FBRXpCLElBQU0sVUFBMEI7QUFBQSxFQUMvQixlQUFlO0FBQUE7QUFBQTtBQUFBLEVBR2Y7QUFBQSxJQUNDLE1BQU07QUFBQSxJQUNOLHdCQUF3QixDQUFDLFdBQVc7QUFDbkMsYUFBTyxZQUFZLElBQUksQ0FBQyxHQUFHLEtBQUssU0FBUztBQUN4QyxZQUFJLFVBQVUsOEJBQThCLGFBQWE7QUFDekQsWUFBSSxVQUFVLGdDQUFnQyxjQUFjO0FBQzVELFlBQUksVUFBVSxnQ0FBZ0MsY0FBYztBQUM1RCxhQUFLO0FBQUEsTUFDTixDQUFDO0FBQUEsSUFDRjtBQUFBLElBQ0EsaUJBQWlCLENBQUMsV0FBVztBQUM1QixhQUFPLFlBQVksSUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFTO0FBQ3hDLFlBQUksVUFBVSw4QkFBOEIsYUFBYTtBQUN6RCxZQUFJLFVBQVUsZ0NBQWdDLGNBQWM7QUFDNUQsWUFBSSxVQUFVLGdDQUFnQyxjQUFjO0FBQzVELGFBQUs7QUFBQSxNQUNOLENBQUM7QUFBQSxJQUNGO0FBQUEsRUFDRDtBQUFBLEVBQ0EsVUFBVTtBQUNYO0FBR0EsSUFBSSxDQUFDLFFBQVEsU0FBUyxjQUFjO0FBQ25DLFVBQVE7QUFBQSxLQUNOLE1BQU0sT0FBTyxvSkFBaUIsR0FBRyxXQUFXO0FBQUEsTUFDNUMsU0FBUztBQUFBLE1BQ1QsbUJBQW1CLENBQUMsUUFBUTtBQUMzQixZQUFJLElBQUksYUFBYSxJQUFJLFdBQVcsR0FBRztBQUN0QyxpQkFBTyxJQUFJLGdCQUFnQixzREFBc0Q7QUFBQSxRQUNsRjtBQUVBLGVBQU8sSUFBSSxnQkFBZ0I7QUFBQSxNQUM1QjtBQUFBLElBQ0QsQ0FBQztBQUFBLEVBQ0Y7QUFDRDtBQUVBLElBQU0sU0FBcUI7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLE1BQ2IsU0FBUyxzQkFBc0IsYUFBYSxDQUFDLFNBQVMsVUFBVSxDQUFDLENBQUM7QUFBQSxJQUNuRTtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNOLFdBQVc7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxJQUFJLEVBQUUsT0FBTyxDQUFDLGtCQUFrQiwrQkFBK0IsRUFBRTtBQUFBO0FBQUEsSUFFakUsU0FBUztBQUFBLE1BQ1IsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsSUFDakM7QUFBQSxFQUNEO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDYixTQUFTLENBQUMsc0JBQXNCLGtCQUFrQixpQkFBaUI7QUFBQSxFQUNwRTtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0osWUFBWSxDQUFDLHNCQUFzQixnQkFBZ0I7QUFBQSxJQUNuRCxVQUFVLENBQUMsU0FBUyxtQkFBbUI7QUFBQSxFQUN4QztBQUNEO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
