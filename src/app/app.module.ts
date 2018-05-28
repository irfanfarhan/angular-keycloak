import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {KeycloakService} from './keycloak/keycloak.service';
import {HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import {KeycloakHttp, keycloakHttpFactory} from './keycloak/keycloak.http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XlsxToJsonService } from './xlsx-to-json-service';
import { ToastrModule } from 'ngx-toastr';
import { SidebarModule } from 'ng-sidebar';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
    BrowserModule,
    BrowserAnimationsModule,
		HttpModule,
    FormsModule,
	ReactiveFormsModule,
	ModalModule,
	ToastrModule.forRoot(),
	SidebarModule.forRoot(),
	ModalModule.forRoot()
	],
	providers: [
		{
			provide: KeycloakHttp,
			useFactory: keycloakHttpFactory,
			deps: [XHRBackend, RequestOptions, KeycloakService]
		},
    KeycloakService,
    XlsxToJsonService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
