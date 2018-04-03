import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {KeycloakService} from './keycloak/keycloak.service';
import {HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import {KeycloakHttp, keycloakHttpFactory} from './keycloak/keycloak.http';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		HttpModule
	],
	providers: [
		{
			provide: KeycloakHttp,
			useFactory: keycloakHttpFactory,
			deps: [XHRBackend, RequestOptions, KeycloakService]
		},
		KeycloakService,
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
