"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./middleware.ts":
/*!***********************!*\
  !*** ./middleware.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/auth */ \"(middleware)/./auth.ts\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/esm/api/server.js\");\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_auth__WEBPACK_IMPORTED_MODULE_0__.auth)((req)=>{\n    const isLoggedIn = !!req.auth;\n    const path = req.nextUrl.pathname;\n    const isProtected = path.startsWith('/cabinet');\n    const isAuthPage = path === '/' || path === '/recovery';\n    if (isProtected && !isLoggedIn) {\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(new URL('/', req.url));\n    }\n    if (path === '/recovery' && isLoggedIn) {\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(new URL('/cabinet', req.url));\n    }\n}));\nconst config = {\n    matcher: [\n        '/',\n        '/recovery',\n        '/cabinet/:path*'\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbWlkZGxld2FyZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTZCO0FBQ2E7QUFFMUMsaUVBQWVBLDJDQUFJQSxDQUFDLENBQUNFO0lBQ25CLE1BQU1DLGFBQWEsQ0FBQyxDQUFDRCxJQUFJRixJQUFJO0lBQzdCLE1BQU1JLE9BQU9GLElBQUlHLE9BQU8sQ0FBQ0MsUUFBUTtJQUVqQyxNQUFNQyxjQUFjSCxLQUFLSSxVQUFVLENBQUM7SUFDcEMsTUFBTUMsYUFBYUwsU0FBUyxPQUFPQSxTQUFTO0lBRTVDLElBQUlHLGVBQWUsQ0FBQ0osWUFBWTtRQUM5QixPQUFPRixxREFBWUEsQ0FBQ1MsUUFBUSxDQUFDLElBQUlDLElBQUksS0FBS1QsSUFBSVUsR0FBRztJQUNuRDtJQUVBLElBQUlSLFNBQVMsZUFBZUQsWUFBWTtRQUN0QyxPQUFPRixxREFBWUEsQ0FBQ1MsUUFBUSxDQUFDLElBQUlDLElBQUksWUFBWVQsSUFBSVUsR0FBRztJQUMxRDtBQUNGLEVBQUU7QUFFSyxNQUFNQyxTQUFTO0lBQ3BCQyxTQUFTO1FBQUM7UUFBSztRQUFhO0tBQWtCO0FBQ2hELEVBQUMiLCJzb3VyY2VzIjpbIi9ob21lL2FkaWxhbm5pc3Rlci9kb2thMi9kb2thMl9mcm9udF9uZXh0L21pZGRsZXdhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0aCB9IGZyb20gJ0AvYXV0aCdcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBhdXRoKChyZXEpID0+IHtcbiAgY29uc3QgaXNMb2dnZWRJbiA9ICEhcmVxLmF1dGhcbiAgY29uc3QgcGF0aCA9IHJlcS5uZXh0VXJsLnBhdGhuYW1lXG5cbiAgY29uc3QgaXNQcm90ZWN0ZWQgPSBwYXRoLnN0YXJ0c1dpdGgoJy9jYWJpbmV0JylcbiAgY29uc3QgaXNBdXRoUGFnZSA9IHBhdGggPT09ICcvJyB8fCBwYXRoID09PSAnL3JlY292ZXJ5J1xuXG4gIGlmIChpc1Byb3RlY3RlZCAmJiAhaXNMb2dnZWRJbikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UucmVkaXJlY3QobmV3IFVSTCgnLycsIHJlcS51cmwpKVxuICB9XG5cbiAgaWYgKHBhdGggPT09ICcvcmVjb3ZlcnknICYmIGlzTG9nZ2VkSW4pIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KG5ldyBVUkwoJy9jYWJpbmV0JywgcmVxLnVybCkpXG4gIH1cbn0pXG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIG1hdGNoZXI6IFsnLycsICcvcmVjb3ZlcnknLCAnL2NhYmluZXQvOnBhdGgqJ10sXG59XG4iXSwibmFtZXMiOlsiYXV0aCIsIk5leHRSZXNwb25zZSIsInJlcSIsImlzTG9nZ2VkSW4iLCJwYXRoIiwibmV4dFVybCIsInBhdGhuYW1lIiwiaXNQcm90ZWN0ZWQiLCJzdGFydHNXaXRoIiwiaXNBdXRoUGFnZSIsInJlZGlyZWN0IiwiVVJMIiwidXJsIiwiY29uZmlnIiwibWF0Y2hlciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./middleware.ts\n");

/***/ })

});