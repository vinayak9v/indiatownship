/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/profile` | `/(tabs)/saved` | `/(tabs)/search` | `/_sitemap` | `/login` | `/profile` | `/register` | `/saved` | `/search`;
      DynamicRoutes: `/property/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/property/[slug]`;
    }
  }
}
