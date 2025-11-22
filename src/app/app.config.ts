import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';


import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app-routing.module';

export function tokenGetter() {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('token');
  }
  return null;
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['transpobl-backend.onrender.com'],
          disallowedRoutes: ['https://transpobl-backend.onrender.com/login'],

        },
      })
    ), provideAnimationsAsync(),
  ]

};
