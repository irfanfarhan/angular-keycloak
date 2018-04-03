import {AngularKeycloakPage} from "./app.po";

describe('angular-keycloak App', () => {
	let page: AngularKeycloakPage;

	beforeEach(() => {
		page = new AngularKeycloakPage();
	});

	it('should display welcome message', () => {
		page.navigateTo();
		expect(page.getParagraphText()).toEqual('Welcome to app!');
	});
});
