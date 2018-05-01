import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { KeycloakService } from './keycloak/keycloak.service';
import { KeycloakHttp } from './keycloak/keycloak.http';
import { environment } from '../environments/environment';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { XlsxToJsonService } from './xlsx-to-json-service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  realm: string;
  email: string;
  isEditable: boolean = false;
  isTokenCardVisible: boolean = false;
  isAPICardsVisible: boolean = false;
  isAddUserVisible: boolean = false;
  isAddMultiUserVisible: boolean = false;
  username: string;
  fullName: string;
  usersArray = [];
  name: any;
  search: any;
  first: any;
  max: number;
  pervious: number;

  userData: AddUser = new AddUser();
  credentials: Credentials = new Credentials();
  createUserForm: FormGroup;
  result: any = [];
  results: any = [];
  @ViewChild('fileInput') inputEl: ElementRef;
  filename: string;
  constructor(private keycloakHttp: KeycloakHttp,
    private _fb: FormBuilder,
    private xlsxToJsonService: XlsxToJsonService,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.first = 0;
    this.max = 20;
    this.createUserForm = this._fb.group({
      username: [''],
      firstName: [''],
      email: ['', Validators.required],
      lastName: [''],
      confirmPassword: [''],
      password: ['']
    });
    this.filename = '';
    this.getUserInfoFromToken();
  }
  reset(): void {
    this.isTokenCardVisible = false;
    this.isAPICardsVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isEditable = false;
    this.usersArray = [];
  }

  getUserInfoFromToken(): void {
    this.username = KeycloakService.getUsername();
    this.fullName = KeycloakService.getFullName();
    this.email = KeycloakService.getEmail();
    this.realm = KeycloakService.getRealm();
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = true;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isEditable = false;
  }

  getUsersFromApi(query?: any): void {
    let url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users?first=' + this.first + '&max=' + this.max;
    if (query) {
      url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users?first=' + this.first + '&max=' + this.max + '&search=' + query;
    }
    this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          this.usersArray = result;
          this.isAPICardsVisible = true;
          this.isTokenCardVisible = false;
          this.isAddUserVisible = false;
          this.isAddMultiUserVisible = false;
          this.isEditable = false;
        },
        error => console.log(error),
        () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }
  openAddUser() {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = true;
    this.isAddMultiUserVisible = false;
    this.isEditable = false;
    this.userData = new AddUser();
  }
  createUser(userData): void {
    if (userData.id) {
      const url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users/' + userData.id;
      this.keycloakHttp.put(url, userData)
        .subscribe(
          result => {
            this.toastr.success(userData.username + ' is updated successfully.');
            this.getUsersFromApi();
            //this.setPassword(result.headers.values()[0][0]);
          },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    } else {
      const url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users';
      this.keycloakHttp.post(url, userData)
        .subscribe(
          result => {
            this.toastr.success(' User is added successfully.');
            this.setPassword(result.headers.values()[0][0]);
          },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    }
  }

  setPassword(api?: any) {
    const url = api + '/reset-password';
    this.keycloakHttp.put(url, this.credentials)
      .subscribe(
        result => {
          this.getUsersFromApi();
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }
  deleteUser(data) {
    const url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users/' + data.id;
    this.keycloakHttp.delete(url)
      .subscribe(
        result => {
          this.toastr.success(data.username + ' is deleted successfully.');
          this.getUsersFromApi();
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }
  openAddMultipleUser(): void {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = true;
    this.isEditable = false;
    this.filename = '';
    this.result = [];
    this.results = [];
  }

  searchRecords(query) {
    console.log(query);
    this.getUsersFromApi(query);
  }
  firstPage() {
    this.first = 0;
    this.max = 20;
    this.getUsersFromApi();
  }
  previousPage() {
    this.first = this.first - 20;
    this.getUsersFromApi();
  }
  nextPage() {
    this.first = this.first + 20;
    this.getUsersFromApi();
  }
  logout(): void {
    KeycloakService.logout();
  }
  handleFile(event) {
    const inputEl: HTMLInputElement = this.inputEl.nativeElement;

    if (inputEl.files.length === 0) {
      return;
    } else {
      this.filename = '';
      const files: FileList = inputEl.files;
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files.length === 1) {
          this.filename += files[i].name;
          this.filename = this.filename.replace(/\\/g, '/').replace(/.*\//, '').substring(0, 25);
        } else {
          this.filename = files.length + ' Files Selected';
        }
      }
    }
    const file = event.target.files[0];
    this.xlsxToJsonService.processFileToJson([], file).subscribe(data => {
      this.result = data['sheets'].Sheet1;
      this.results = JSON.stringify(this.result);
    });
  }
  addUsers(data) {
    if (data) {
      for (const key of this.result) {
        key['enabled'] = true;
        key['emailVerified'] = '';
        this.createUser(key);
      }
    }
  }
  editUser(data) {
    console.log(data);
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = true;
    this.isAddMultiUserVisible = false;
    this.userData = data;
    this.isEditable = true;
  }
  grantAccess(data) {
    const requestPayload = { "realm": this.realm, "user": user.id }
    const url = environment.keycloakRootUrl + '/admin/realms/'+  this.realm + '/users/' + user.id + '/impersonation';
    this.keycloakHttp.post(url, requestPayload)
      .subscribe(
        result => {
          console.log(JSON.parse(result._body).redirect);
          const url = JSON.parse(result._body).redirect;
          window.open(url, "_blank");
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }
  formatText(data) {
    if (data) {
      console.log(data);
      let format = data.split(' ');
      format = format.charAt(0).toUpperCase().substr(3);
      console.log(format);
    }
  }

  transform(value) {
    if (!value) return value;
    return value.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.charAt(1).toUpperCase() + txt.charAt(2).toUpperCase() + txt.substr(3).toLowerCase();
    });
  }
}


export class AddUser {
  username: string;
  enabled: boolean = true;
  emailVerified: string = '';
  firstName: string;
  lastName: string;
  email: string;
}

export class Credentials {
  type: string = 'password';
  value: string = 'welcome1';
  temporary: boolean = true;
}
