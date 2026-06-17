/**
 * Web dependency shim
 * Forces react-native-web to be detected and installed for web builds.
 * This file is only bundled on web platform (.web.ts extension).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
import 'react-native-web';
